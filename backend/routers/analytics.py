from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from typing import Optional
import io
import pandas as pd
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

from ..services import analytics_service, analytics_ai_service
from .. import data_handler

router = APIRouter()

@router.get("/analytics/overview")
async def get_analytics_overview(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Obtiene las métricas generales de analytics"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None or users_df is None or social_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos. Verifique que los archivos CSV existan en la carpeta 'data'.")

        data = analytics_service.get_analytics_data(users_df, campaigns_df, social_df, period)
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/export/pdf")
async def export_pdf(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Genera un reporte en PDF con insights de IA"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None or users_df is None or social_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos. Verifique que los archivos CSV existan en la carpeta 'data'.")

        service = analytics_service.AnalyticsService(users_df, campaigns_df, social_df)

        # Obtener todos los datos
        overview = service.get_overview_metrics(period)
        campaigns = service.get_top_campaigns(period, limit=10)
        segments = service.get_segment_performance()
        analytics_data = analytics_service.get_analytics_data(users_df, campaigns_df, social_df, period)

        # Obtener insights de IA
        insights = analytics_ai_service.get_analytics_ai_insights(analytics_data)
        summary = analytics_ai_service.get_report_summary(analytics_data)

        # Crear PDF en memoria
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()

        # Estilos personalizados
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#6366f1'),
            spaceAfter=30,
            alignment=TA_CENTER
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=12,
            spaceBefore=12
        )

        # Título
        story.append(Paragraph("Reporte de Análisis de Marketing", title_style))
        story.append(Paragraph(f"Período: {period} | Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))

        # Resumen Ejecutivo
        story.append(Paragraph("Resumen Ejecutivo", heading_style))
        story.append(Paragraph(summary, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))

        # Métricas Principales
        story.append(Paragraph("Métricas Principales", heading_style))

        metrics_data = [
            ['Métrica', 'Valor'],
            ['Total Conversiones', f"{overview['total_conversions']:,}"],
            ['Total Enviados', f"{overview['total_sent']:,}"],
            ['Tasa de Apertura', f"{overview['open_rate']}%"],
            ['CTR', f"{overview['ctr']}%"],
            ['Tasa de Conversión', f"{overview['conversion_rate']}%"],
            ['ROI', f"{overview['roi']}x"],
            ['Total Campañas', str(overview.get('total_campaigns', 'N/A'))]
        ]

        metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(metrics_table)
        story.append(Spacer(1, 0.4*inch))

        # Insights de IA
        story.append(Paragraph("Insights de Inteligencia Artificial", heading_style))

        # Mejor hora de envío
        best_time = insights.get('best_send_time', {})
        story.append(Paragraph(
            f"<b>Mejor Momento de Envío:</b> {best_time.get('day', 'N/A')} a las {best_time.get('time', 'N/A')} "
            f"({best_time.get('improvement', 'N/A')} de mejora en apertura)",
            styles['Normal']
        ))
        story.append(Spacer(1, 0.1*inch))

        # Segmento más rentable
        top_seg = insights.get('top_segment', {})
        story.append(Paragraph(
            f"<b>Segmento Más Rentable:</b> {top_seg.get('name', 'N/A')} "
            f"(CLV ${top_seg.get('clv', 0):,})",
            styles['Normal']
        ))
        story.append(Spacer(1, 0.1*inch))

        # Alerta de churn
        churn = insights.get('churn_alert', {})
        story.append(Paragraph(
            f"<b>Alerta:</b> {churn.get('users', 0):,} usuarios en riesgo de abandono. "
            f"Acción recomendada: {churn.get('action', 'N/A')}",
            styles['Normal']
        ))
        story.append(Spacer(1, 0.3*inch))

        # Recomendaciones
        story.append(Paragraph("Recomendaciones Estratégicas", heading_style))
        recommendations = insights.get('recommendations', [])
        for i, rec in enumerate(recommendations[:5], 1):
            story.append(Paragraph(
                f"<b>{i}. {rec.get('title', '')}:</b> {rec.get('description', '')} "
                f"(Impacto: {rec.get('impact', 'medio')})",
                styles['Normal']
            ))
            story.append(Spacer(1, 0.1*inch))

        story.append(Spacer(1, 0.3*inch))

        # Top Campañas
        story.append(Paragraph("Top 10 Campañas del Período", heading_style))

        campaigns_data = [['Campaña', 'Canal', 'Enviados', 'Apertura', 'CTR', 'Conversión']]
        for camp in campaigns[:10]:
            campaigns_data.append([
                camp.get('name', '')[:30],
                camp.get('channel', ''),
                f"{camp.get('sent', 0):,}",
                f"{camp.get('open_rate', 0)}%",
                f"{camp.get('ctr', 0)}%",
                f"{camp.get('conversion_rate', 0)}%"
            ])

        campaigns_table = Table(campaigns_data, colWidths=[2.2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 0.6*inch, 0.8*inch])
        campaigns_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))

        story.append(campaigns_table)
        story.append(PageBreak())

        # Análisis de Segmentos
        story.append(Paragraph("Análisis por Segmentos de Usuario", heading_style))

        segments_data = [['Segmento', 'Usuarios', 'CLV Promedio', 'Tasa Conversión']]
        for seg in segments:
            segments_data.append([
                seg.get('segment', ''),
                f"{seg.get('users', 0):,}",
                f"${seg.get('clv', 0):,.2f}",
                f"{seg.get('conversion_rate', 0)}%"
            ])

        segments_table = Table(segments_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        segments_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(segments_table)
        story.append(Spacer(1, 0.3*inch))

        # Tendencias Detectadas
        story.append(Paragraph("Tendencias Detectadas", heading_style))
        trends = insights.get('trends', [])
        for trend in trends:
            story.append(Paragraph(
                f"<b>{trend.get('trend', '')}:</b> {trend.get('insight', '')}",
                styles['Normal']
            ))
            story.append(Spacer(1, 0.1*inch))

        # Footer
        story.append(Spacer(1, 0.5*inch))
        story.append(Paragraph(
            "Este reporte fue generado automáticamente por OmniMark Analytics con asistencia de IA",
            styles['Italic']
        ))

        # Construir PDF
        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=reporte_analytics_{period}_{datetime.now().strftime('%Y%m%d')}.pdf"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/conversions")
async def get_conversion_evolution(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Obtiene la evolución de conversiones"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None or users_df is None or social_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos. Verifique que los archivos CSV existan en la carpeta 'data'.")

        service = analytics_service.AnalyticsService(users_df, campaigns_df, social_df)
        evolution = service.get_conversion_evolution(period)

        return evolution

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/top-campaigns")
async def get_top_campaigns(
    period: str = Query('30days', regex='^(7days|30days|3months|year)$'),
    limit: int = Query(10, ge=1, le=50)
):
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None or users_df is None or social_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos. Verifique que los archivos CSV existan en la carpeta 'data'.")

        service = analytics_service.AnalyticsService(users_df, campaigns_df, social_df)
        campaigns = service.get_top_campaigns(period, limit)

        return {"campaigns": campaigns}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/ai-insights")
async def get_ai_insights(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Genera insights usando IA (ChatGPT)"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None or users_df is None or social_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos. Verifique que los archivos CSV existan en la carpeta 'data'.")

        # Obtener datos de analytics
        analytics_data = analytics_service.get_analytics_data(users_df, campaigns_df, social_df, period)

        # Generar insights con IA
        insights = analytics_ai_service.get_analytics_ai_insights(analytics_data)

        return insights

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/export/csv")
async def export_csv(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Exporta los datos de analytics a CSV"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos")

        service = analytics_service.AnalyticsService(users_df, campaigns_df, social_df)

        # Obtener datos para exportar
        overview = service.get_overview_metrics(period)
        campaigns = service.get_top_campaigns(period, limit=50)

        # Crear DataFrame
        df = pd.DataFrame(campaigns)

        # Agregar resumen al inicio
        summary_data = {
            'Métrica': ['Total Conversiones', 'Total Enviados', 'Tasa Apertura', 'CTR', 'Tasa Conversión', 'ROI'],
            'Valor': [
                overview['total_conversions'],
                overview['total_sent'],
                f"{overview['open_rate']}%",
                f"{overview['ctr']}%",
                f"{overview['conversion_rate']}%",
                f"{overview['roi']}x"
            ]
        }
        summary_df = pd.DataFrame(summary_data)

        # Crear CSV en memoria
        output = io.StringIO()
        output.write("RESUMEN DE ANALYTICS\n")
        output.write(f"Período: {period}\n")
        output.write(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

        summary_df.to_csv(output, index=False)
        output.write("\n\nDETALLE DE CAMPAÑAS\n")
        df.to_csv(output, index=False)

        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_{period}_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/export/excel")
async def export_excel(period: str = Query('30days', regex='^(7days|30days|3months|year)$')):
    """Exporta los datos de analytics a Excel con múltiples hojas"""
    try:
        users_df, campaigns_df, social_df = data_handler.load_data()

        if campaigns_df is None:
            raise HTTPException(status_code=500, detail="No se pudieron cargar los datos")

        service = analytics_service.AnalyticsService(users_df, campaigns_df, social_df)

        # Obtener todos los datos
        overview = service.get_overview_metrics(period)
        campaigns = service.get_top_campaigns(period, limit=50)
        segments = service.get_segment_performance()
        evolution = service.get_conversion_evolution(period)

        # Crear archivo Excel en memoria
        output = io.BytesIO()

        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Hoja 1: Resumen
            summary_data = {
                'Métrica': ['Total Conversiones', 'Total Enviados', 'Tasa Apertura', 'CTR', 'Tasa Conversión', 'ROI', 'Total Campañas'],
                'Valor': [
                    overview['total_conversions'],
                    overview['total_sent'],
                    f"{overview['open_rate']}%",
                    f"{overview['ctr']}%",
                    f"{overview['conversion_rate']}%",
                    f"{overview['roi']}x",
                    overview.get('total_campaigns', 0)
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Resumen', index=False)

            # Hoja 2: Top Campañas
            pd.DataFrame(campaigns).to_excel(writer, sheet_name='Top Campañas', index=False)

            # Hoja 3: Segmentos
            pd.DataFrame(segments).to_excel(writer, sheet_name='Segmentos', index=False)

            # Hoja 4: Evolución
            evolution_df = pd.DataFrame({
                'Fecha': evolution.get('labels', []),
                'Conversiones': evolution.get('conversions', []),
                'Aperturas': evolution.get('opens', []),
                'Clicks': evolution.get('clicks', [])
            })
            evolution_df.to_excel(writer, sheet_name='Evolución', index=False)

            # Dar formato
            workbook = writer.book
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#6366f1',
                'font_color': 'white',
                'border': 1
            })

            for sheet_name in writer.sheets:
                worksheet = writer.sheets[sheet_name]
                worksheet.set_column('A:Z', 15)

        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=analytics_{period}_{datetime.now().strftime('%Y%m%d')}.xlsx"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    