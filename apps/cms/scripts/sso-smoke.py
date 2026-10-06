#!/usr/bin/env python3
"""
End-to-end smoke test of the SSO login/logout against the local Keycloak
(docker compose up -d keycloak) and the CMS (pnpm dev). Acts like a browser.

Usage: python3 apps/cms/scripts/sso-smoke.py
"""
import html
import http.cookiejar
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

CMS = "http://localhost:3001"
PASSWORD = "Senha-123"
# Local account to check the local login (env: SMOKE_LOCAL_EMAIL / SMOKE_LOCAL_PASSWORD).
import os
LOCAL_EMAIL = os.environ.get("SMOKE_LOCAL_EMAIL", "")
LOCAL_PASSWORD = os.environ.get("SMOKE_LOCAL_PASSWORD", "")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


class Browser:
    def __init__(self, headers=None):
        # Browsers send Sec-Fetch-Site; Payload's CSRF protection relies on it for cookies.
        self.headers = headers if headers is not None else {"Sec-Fetch-Site": "same-origin"}
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            NoRedirect, urllib.request.HTTPCookieProcessor(self.jar)
        )

    def request(self, url, data=None, method=None):
        body = urllib.parse.urlencode(data).encode() if data is not None else None
        req = urllib.request.Request(url, data=body, method=method, headers=self.headers)
        try:
            res = self.opener.open(req, timeout=60)
        except urllib.error.HTTPError as err:
            res = err
        # Browsers treat http://localhost as a secure context and send Secure cookies there
        # (Keycloak marks its cookies Secure); Python's cookiejar does not, so relax it.
        for cookie in self.jar:
            cookie.secure = False
        return res.status, res.headers.get("Location"), res.read().decode("utf-8", "replace")

    def post_json(self, url, payload):
        req = urllib.request.Request(
            url, data=json.dumps(payload).encode(), method="POST",
            headers={**self.headers, "Content-Type": "application/json"},
        )
        try:
            res = self.opener.open(req, timeout=60)
        except urllib.error.HTTPError as err:
            res = err
        return res.status, res.read().decode("utf-8", "replace")

    def follow(self, url, data=None, method=None, max_hops=10):
        """Follows redirects; returns (final_status, final_url, body)."""
        status, location, body = self.request(url, data, method)
        while status in (301, 302, 303, 307, 308) and location and max_hops:
            url = urllib.parse.urljoin(url, location)
            status, location, body = self.request(url)
            max_hops -= 1
        return status, url, body

    def me(self):
        _, _, body = self.request(f"{CMS}/api/users/me")
        return json.loads(body).get("user")

    def cookie(self, name):
        return next((c.value for c in self.jar if c.name == name), None)


def sso_login(browser, username):
    # 1. CMS -> Keycloak login page
    status, url, body = browser.follow(f"{CMS}/auth/sso/login")
    match = re.search(r'<form[^>]*id="kc-form-login"[^>]*action="([^"]+)"', body)
    if not match:
        raise AssertionError(f"Keycloak login form not found (status {status}, url {url})")
    action = html.unescape(match.group(1))
    # 2. Submit credentials -> Keycloak -> CMS callback -> admin
    return browser.follow(action, {"username": username, "password": PASSWORD, "credentialId": ""})


results = []


def check(name, condition, detail=""):
    results.append(condition)
    print(f"  {'OK ' if condition else 'FALHOU'} {name}{'' if condition else ' -> ' + detail}")


print("SSO: login, sessão e logout")
b = Browser()
status, url, _ = sso_login(b, "sso.editor")
check("editor do SSO volta ao /admin", url.startswith(f"{CMS}/admin") and "sso_error" not in url, url)
user = b.me()
check("sessão SSO reconhecida pela API", bool(user) and user.get("email") == "sso.editor@digio.local", str(user))
check("usuário criado como provedor SSO", bool(user) and user.get("authProvider") == "sso", str(user))
tenant_rows = [(r["tenant"]["slug"] if isinstance(r["tenant"], dict) else r["tenant"], r["roles"]) for r in (user or {}).get("tenants", [])]
check("papéis vindos dos grupos do SSO", tenant_rows == [("digio", ["editor"])], str(tenant_rows))
check("sem cookie de sessão local do Payload", b.cookie("payload-token") is None)
old_session = b.cookie("digio-sso-session")

status, url, _ = b.follow(f"{CMS}/auth/sso/logout", data={}, method="POST")
check("logout do SSO passa pelo Keycloak e volta ao login", url.startswith(f"{CMS}/admin/login"), url)
check("sessão encerrada após o logout", b.me() is None)

replay = Browser()
replay.jar.set_cookie(http.cookiejar.Cookie(0, "digio-sso-session", old_session, None, False, "localhost", False, False, "/", True, False, None, False, None, None, {}))
check("cookie antigo não funciona após o logout (revogado no servidor)", replay.me() is None)

status, url, body = b.follow(f"{CMS}/auth/sso/login")
check("sessão do Keycloak também foi encerrada (pede senha de novo)", 'id="kc-form-login"' in body, url)

print("SSO: cenários que devem ser recusados")
for username, code in [
    ("sso.semacesso", "no_access"),
    ("sso.colisao", "local_account"),
]:
    b = Browser()
    _, url, _ = sso_login(b, username)
    check(f"{username} recusado com {code}", f"sso_error={code}" in url, url)
    check(f"{username} sem sessão", b.me() is None)

print("SSO: super admin e usuário com papéis em duas propriedades")
b = Browser()
sso_login(b, "sso.admin")
user = b.me()
check("super admin via papel do realm", bool(user) and user.get("roles") == ["super-admin"], str(user))
b = Browser()
sso_login(b, "sso.multi")
user = b.me() or {}
rows = sorted((r["tenant"]["slug"] if isinstance(r["tenant"], dict) else r["tenant"], tuple(r["roles"])) for r in user.get("tenants", []))
check("papéis em duas propriedades", rows == [("campanha-exemplo", ("editor",)), ("digio", ("seo",))], str(rows))

print("Segurança do callback")
b = Browser()
status, url, _ = b.follow(f"{CMS}/auth/sso/callback?code=forjado&state=forjado")
check("callback sem o cookie do fluxo é recusado", "sso_error=sso_failed" in url, url)
b = Browser()
b.follow(f"{CMS}/auth/sso/login")  # obtém um cookie de fluxo válido
status, url, _ = b.follow(f"{CMS}/auth/sso/callback?code=forjado&state=adulterado")
check("state adulterado é recusado", "sso_error=sso_failed" in url, url)
check("sem sessão após callback forjado", b.me() is None)

print("Proteção CSRF do cookie SSO (mesma regra do cookie local do Payload)")
b = Browser()
sso_login(b, "sso.editor")
session = b.cookie("digio-sso-session")
for label, headers in [
    ("origem externa", {"Origin": "https://site-malicioso.example"}),
    ("cliente sem Origin nem Sec-Fetch-Site", {}),
    ("requisição cross-site", {"Sec-Fetch-Site": "cross-site"}),
]:
    other = Browser(headers)
    other.jar.set_cookie(http.cookiejar.Cookie(0, "digio-sso-session", session, None, False, "localhost", False, False, "/", True, False, None, False, None, None, {}))
    check(f"cookie SSO recusado: {label}", other.me() is None)
check("mesma origem continua aceita", b.me() is not None)

print("Login e logout local (conta local)")
b = Browser()
status, body = b.post_json(f"{CMS}/api/users/login", {"email": LOCAL_EMAIL, "password": LOCAL_PASSWORD})
user = b.me() or {}
check("conta local entra com e-mail e senha", status == 200 and user.get("email") == LOCAL_EMAIL, f"{status} {user}")
check("sessão local não cria cookie SSO", b.cookie("digio-sso-session") is None)
status, _, _ = b.request(f"{CMS}/api/users/logout", {}, "POST")
check("logout local encerra a sessão local", status == 200 and b.me() is None, str(status))

print("Login local de conta SSO")
b = Browser()
status, body = b.post_json(f"{CMS}/api/users/login", {"email": "sso.editor@digio.local", "password": PASSWORD})
check("conta SSO não entra com e-mail e senha", status == 401, f"{status} {body[:120]}")

print("SSO: revogação no Keycloak (precisa de SSO_REVALIDATE_SECONDS=3 no CMS)")
KC = "http://localhost:8080"
KC_ADMIN = (os.environ.get("KEYCLOAK_ADMIN_USER", "admin"), os.environ.get("KEYCLOAK_ADMIN_PASSWORD", "admin"))


def kc(method, path, data=None, token=None, form=False):
    body = urllib.parse.urlencode(data).encode() if form else (json.dumps(data).encode() if data is not None else None)
    headers = {"Content-Type": "application/x-www-form-urlencoded" if form else "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    with urllib.request.urlopen(urllib.request.Request(KC + path, body, headers, method=method)) as res:
        text = res.read()
        return json.loads(text) if text else None


if os.environ.get("SSO_REVALIDATE_SECONDS") == "3":
    import time
    token = kc("POST", "/realms/master/protocol/openid-connect/token",
               {"grant_type": "password", "client_id": "admin-cli", "username": KC_ADMIN[0], "password": KC_ADMIN[1]}, form=True)["access_token"]
    uid = kc("GET", "/admin/realms/digio/users?username=sso.editor&exact=true", token=token)[0]["id"]
    groups = kc("GET", f"/admin/realms/digio/users/{uid}/groups", token=token)
    for scenario in ("grupo removido", "usuário desabilitado"):
        b = Browser()
        sso_login(b, "sso.editor")
        time.sleep(4)
        check("sessão continua válida enquanto o acesso existe", b.me() is not None)
        if scenario == "grupo removido":
            for g in groups:
                kc("DELETE", f"/admin/realms/digio/users/{uid}/groups/{g['id']}", token=token)
        else:
            kc("PUT", f"/admin/realms/digio/users/{uid}", {"enabled": False}, token=token)
        time.sleep(4)
        check(f"sessão do CMS encerrada: {scenario} no Keycloak", b.me() is None)
        kc("PUT", f"/admin/realms/digio/users/{uid}", {"enabled": True}, token=token)
        for g in groups:
            kc("PUT", f"/admin/realms/digio/users/{uid}/groups/{g['id']}", token=token)
else:
    print("  (pulado: suba o CMS com SSO_REVALIDATE_SECONDS=3 para testar)")

print()
print(f"{sum(results)}/{len(results)} verificações passaram")
sys.exit(0 if all(results) else 1)
