#!/usr/bin/env python3
"""
Anonymous (public) attack-surface smoke test against a running CMS + website
(pnpm dev, or any environment: CMS=https://... WEB=https://... python3 ...).

Usage: python3 apps/cms/scripts/public-api-smoke.py
"""
import json
import os
import sys
import urllib.error
import urllib.request

CMS = os.environ.get("CMS", "http://localhost:3001")
WEB = os.environ.get("WEB", "http://localhost:3000")
results = []


def call(url, data=None, headers=None, method=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, body, {"Content-Type": "application/json", **(headers or {})}, method=method)
    try:
        res = urllib.request.urlopen(req, timeout=60)
    except urllib.error.HTTPError as err:
        res = err
    return res.status, res.read().decode("utf-8", "replace")


def check(name, condition, detail=""):
    results.append(condition)
    print(f"  {'OK ' if condition else 'FALHOU'} {name}{'' if condition else ' -> ' + detail}")


print("API pública (anônimo)")
for path in ("pages/versions", "posts/versions", "users", "form-submissions", "payload-preferences"):
    status, _ = call(f"{CMS}/api/{path}")
    check(f"/api/{path} fechado", status == 403, str(status))

_, body = call(f"{CMS}/api/pages?draft=true&limit=100&depth=0")
statuses = {doc.get("_status") for doc in json.loads(body).get("docs", [])}
check("só páginas publicadas, mesmo com ?draft=true", statuses <= {"published"}, str(statuses))

status, _ = call(f"{CMS}/api/graphql", {"query": "{__typename}"}, method="POST")
check("GraphQL desligado", status == 404, str(status))

_, body = call(f"{CMS}/api/forms?depth=0&limit=10")
forms = json.loads(body).get("docs", [])
check("emails dos formulários não vazam", all(not f.get("emails") for f in forms))

print("Envio de formulário anônimo")
origin = {"Origin": WEB}
if forms:
    form = forms[0]["id"]
    field = (forms[0].get("fields") or [{}])[0].get("name", "x")
    status, _ = call(f"{CMS}/api/form-submissions", {"form": form, "submissionData": [{"field": field, "value": "smoke"}]}, origin, "POST")
    check("envio válido é aceito", status == 201, str(status))
    status, _ = call(f"{CMS}/api/form-submissions", {"form": form, "tenant": 999, "submissionData": []}, origin, "POST")
    check("tenant enviado pelo cliente é recusado", status == 400, str(status))
    big = [{"field": field, "value": "A" * 20000}]
    status, _ = call(f"{CMS}/api/form-submissions", {"form": form, "submissionData": big}, origin, "POST")
    check("envio grande demais é recusado", status == 400, str(status))

    # Browsers enforce CORS: the API must not allow a foreign origin to call it from a page.
    req = urllib.request.Request(f"{CMS}/api/form-submissions", method="OPTIONS", headers={
        "Origin": "http://evil.example", "Access-Control-Request-Method": "POST"})
    try:
        allow = urllib.request.urlopen(req, timeout=30).headers.get("Access-Control-Allow-Origin")
    except urllib.error.HTTPError as err:
        allow = err.headers.get("Access-Control-Allow-Origin")
    check("CORS não libera origem externa", allow not in ("*", "http://evil.example"), str(allow))

print("Site")
status, _ = call(f"{WEB}/api/revalidate/", {}, method="POST")
check("revalidate sem token: 401", status == 401, str(status))
for query in ("%00", "a", "%27"):
    status, _ = call(f"{WEB}/search/?q={query}")
    check(f"busca com q={query} não quebra", status == 200, str(status))
status, _ = call(f"{WEB}/next/preview/?path=//evil.com&previewToken=1.x")
check("preview recusa open redirect", status == 400, str(status))
status, _ = call(f"{WEB}/next/preview/?path=/&previewToken=1.x")
check("preview recusa token inválido", status == 403, str(status))

print()
print(f"{sum(results)}/{len(results)} verificações passaram")
sys.exit(0 if all(results) else 1)
