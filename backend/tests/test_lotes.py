import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.lote import Lote, LoteFilterParams
from app.repositories.base import LoteRepository
from app.services.lote_service import LoteService
from app.services.lote_filtering import filter_and_sort_lotes, filter_options

client = TestClient(app)

class MockLoteRepository(LoteRepository):
    def __init__(self):
        self.lotes = [
            Lote(
                id="Q-IZ-L-17",
                ordem=838,
                quadra="IZ",
                lote="17",
                gleba="1",
                tamanho_categoria=300,
                area_m2=369.74,
                preco_m2=388.15,
                valor_base=143514.58,
                preco_vista=135391.11,
                preco_financiado_180x=136475.33,
                valor_parcela_180x=877.13,
                entrada_5pct=7175.73,
                corretagem_6pct=8123.47,
                iptu_mensal=46.05,
                disponivel=True
            ),
            Lote(
                id="Q-IW-L-15",
                ordem=788,
                quadra="IW",
                lote="15",
                gleba="1",
                tamanho_categoria=300,
                area_m2=375.66,
                preco_m2=388.15,
                valor_base=145812.43,
                preco_vista=137558.90,
                preco_financiado_180x=138660.47,
                valor_parcela_180x=891.17,
                entrada_5pct=7290.62,
                corretagem_6pct=8253.53,
                iptu_mensal=46.65,
                disponivel=True
            ),
            Lote(
                id="Q-EN-L-28",
                ordem=385,
                quadra="EN",
                lote="28",
                gleba="2",
                tamanho_categoria=400,
                area_m2=390.91,
                preco_m2=552.45,
                valor_base=215958.23,
                preco_vista=203734.18,
                preco_financiado_180x=205365.69,
                valor_parcela_180x=1319.88,
                entrada_5pct=10797.91,
                corretagem_6pct=12224.05,
                iptu_mensal=50.15,
                disponivel=True
            )
        ]

    def get_lote_by_id(self, id_lote: str):
        for l in self.lotes:
            if l.id.lower() == id_lote.lower():
                return l
        return None

    def count_all(self):
        return len(self.lotes)

    def get_lotes_filtered(self, filters: LoteFilterParams):
        items = filter_and_sort_lotes(self.lotes, filters)
        return items, len(items)

    def get_filter_options(self):
        return filter_options(self.lotes)

def test_lote_service_search_and_filters():
    repo = MockLoteRepository()
    service = LoteService(repo)

    # Teste de filtro de busca por quadra
    res = service.list_lotes(LoteFilterParams(q="IZ"))
    assert res.count == 1
    assert res.items[0].quadra == "IZ"

    # Teste de filtro por preço máximo
    res_preco = service.list_lotes(LoteFilterParams(preco_max=150000.0))
    assert res_preco.count == 2

    # Teste de ordenação por preço desc
    res_sort = service.list_lotes(LoteFilterParams(order_by="preco_desc"))
    assert res_sort.items[0].preco_vista > res_sort.items[1].preco_vista

def test_api_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_api_list_lotes():
    response = client.get("/api/v1/lotes")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
