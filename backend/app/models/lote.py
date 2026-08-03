from typing import Optional, List
from pydantic import BaseModel, Field

class Lote(BaseModel):
    id: str = Field(..., description="ID único do lote (composto ou ORD)")
    ordem: Optional[int] = Field(None, description="Número de ordem na planilha")
    quadra: str = Field(..., description="Identificador da Quadra (ex: IZ, EN, JX)")
    lote: str = Field(..., description="Número do Lote")
    gleba: Optional[str] = Field(None, description="Número/Identificador da Gleba")
    tamanho_categoria: Optional[float] = Field(None, description="Categoria de tamanho do lote (ex: 300, 400)")
    area_m2: float = Field(..., description="Área total em metros quadrados")
    preco_m2: Optional[float] = Field(None, description="Valor por metro quadrado em R$")
    valor_base: Optional[float] = Field(None, description="Valor base do lote em R$")
    preco_vista: float = Field(..., description="Preço promocional à vista (1x) em R$")
    preco_financiado_180x: Optional[float] = Field(None, description="Preço financiado em 180x em R$")
    valor_parcela_180x: Optional[float] = Field(None, description="Valor da parcela no plano 180x em R$")
    entrada_5pct: Optional[float] = Field(None, description="Valor da entrada (5%) em R$")
    corretagem_6pct: Optional[float] = Field(None, description="Valor da corretagem (6%) em R$")
    iptu_mensal: Optional[float] = Field(None, description="Valor estimado do IPTU mensal em R$")
    disponivel: bool = Field(True, description="Indicador de disponibilidade do lote")
    local_id: Optional[str] = Field(None, description="Local ao qual o lote pertence")

class LoteFilterParams(BaseModel):
    q: Optional[str] = Field(None, description="Busca textual livre (número do lote ou quadra)")
    local_id: Optional[str] = Field(None, description="Filtrar por Local específico (corretor: forçado pelo token)")
    gleba: Optional[str] = Field(None, description="Filtrar por Gleba específica")
    quadra: Optional[str] = Field(None, description="Filtrar por Quadra específica")
    area_min: Optional[float] = Field(None, description="Área mínima em m²")
    area_max: Optional[float] = Field(None, description="Área máxima em m²")
    preco_min: Optional[float] = Field(None, description="Preço mínimo (à vista) em R$")
    preco_max: Optional[float] = Field(None, description="Preço máximo (à vista) em R$")
    tamanho_categoria: Optional[float] = Field(None, description="Categoria de tamanho (ex: 300, 400)")
    order_by: Optional[str] = Field("preco_asc", description="Ordenação: preco_asc, preco_desc, area_asc, area_desc, lote_asc")

class LoteListResponse(BaseModel):
    total: int
    count: int
    glebas_disponiveis: List[str]
    quadras_disponiveis: List[str]
    items: List[Lote]
