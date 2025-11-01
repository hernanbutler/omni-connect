# -*- coding: utf-8 -*-
"""
Script de configuración para instalar OmniConnect como paquete
"""
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="omniconnect",
    version="1.0.0",
    author="OmniConnect Team",
    author_email="contact@omniconnect.com",
    description="Kit de Marketing Omnicanal con IA",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/tuusuario/omniconnect",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "fastapi>=0.104.1",
        "uvicorn[standard]>=0.24.0",
        "pandas>=2.1.3",
        "python-multipart>=0.0.6",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
        ],
    },
)