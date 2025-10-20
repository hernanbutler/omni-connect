from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class FlowStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DRAFT = "draft"

class StepType(str, Enum):
    TRIGGER = "trigger"
    EMAIL = "email"
    SOCIAL_POST = "social_post"
    DELAY = "delay"
    CONDITION = "condition"
    ACTION = "action"

class TriggerType(str, Enum):
    NEW_USER = "new_user"
    CART_ABANDONED = "cart_abandoned"
    PURCHASE = "purchase"
    BIRTHDAY = "birthday"
    INACTIVE_USER = "inactive_user"
    CUSTOM = "custom"

# Modelos de pasos individuales
class FlowStepConfig(BaseModel):
    step_id: str
    type: StepType
    name: str
    config: Dict[str, Any]  # Configuración específica del paso
    next_steps: List[str] = []  # IDs de los siguientes pasos
    delay_hours: Optional[int] = 0

class EmailStepConfig(BaseModel):
    subject: str
    content: str
    from_name: str = "OmniMark"
    variants: Optional[List[Dict[str, str]]] = None  # Para A/B testing

class DelayStepConfig(BaseModel):
    hours: int
    days: Optional[int] = 0

class ConditionStepConfig(BaseModel):
    condition_type: str  # "opened_email", "clicked_link", "made_purchase"
    true_next_step: str
    false_next_step: str

# Modelo principal de flujo
class AutomationFlow(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    status: FlowStatus = FlowStatus.DRAFT
    trigger_type: TriggerType
    steps: List[FlowStepConfig]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Métricas
    users_in_flow: int = 0
    total_completed: int = 0
    
class FlowMetrics(BaseModel):
    flow_id: str
    users_active: int
    users_completed: int
    open_rate: float
    click_rate: float
    conversion_rate: float
    revenue_generated: float
    avg_completion_days: float

class FlowExecution(BaseModel):
    id: Optional[str] = None
    flow_id: str
    user_id: str
    current_step_id: str
    started_at: datetime
    last_action_at: datetime
    completed: bool = False
    metadata: Dict[str, Any] = {}

class FlowTemplate(BaseModel):
    id: str
    name: str
    description: str
    category: str
    icon: str
    rating: float
    setup_time_minutes: int
    trigger_type: TriggerType
    steps: List[FlowStepConfig]
    is_popular: bool = False
    uses_ai: bool = False

# Request/Response models para la API
class CreateFlowRequest(BaseModel):
    name: str
    description: str
    trigger_type: TriggerType
    steps: List[FlowStepConfig]

class UpdateFlowRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[FlowStatus] = None
    steps: Optional[List[FlowStepConfig]] = None

class FlowStatusResponse(BaseModel):
    flow_id: str
    status: FlowStatus
    message: str

class AIOptimizationRequest(BaseModel):
    flow_id: str
    optimization_type: str  # "subject_lines", "timing", "content"
    
class AIOptimizationResponse(BaseModel):
    flow_id: str
    suggestions: List[Dict[str, Any]]
    predicted_improvement: Optional[float] = None
    insights: List[str]