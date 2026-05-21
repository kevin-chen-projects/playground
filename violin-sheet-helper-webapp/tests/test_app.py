from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health():
    r = client.get('/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'


def test_index_serves_html():
    r = client.get('/')
    assert r.status_code == 200
    assert 'Violin Sheet Helper' in r.text


def test_analyze_returns_mock_guidance():
    files = {'file': ('example.png', b'fake-image-bytes', 'image/png')}
    r = client.post('/analyze', files=files)
    assert r.status_code == 200
    data = r.json()
    assert data['filename'] == 'example.png'
    assert len(data['notes']) > 0
    assert len(data['guidance']) == len(data['notes'])
    assert data['guidance'][0]['note'] == 'E5'
    assert data['guidance'][0]['string'] == 'E'


def test_upload_saves_file():
    files = {'file': ('upload.pdf', b'fake-pdf-bytes', 'application/pdf')}
    r = client.post('/upload', files=files)
    assert r.status_code == 200
    data = r.json()
    assert data['filename'] == 'upload.pdf'
    assert data['size_bytes'] == len(b'fake-pdf-bytes')
    assert Path(data['saved_to']).exists()
