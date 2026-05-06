from flask import Flask, request, jsonify
import time, random, string

app = Flask(__name__)

# "Banco de dados" simples (pode trocar depois por DB real)
CHAVES = {}

# ===== GERAR CHAVE =====
def gerar_chave():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

# ===== CRIAR CHAVE =====
@app.route("/criar", methods=["POST"])
def criar():
    dias = int(request.json.get("dias", 1))
    limite = int(request.json.get("limite", 1))

    chave = gerar_chave()

    CHAVES[chave] = {
        "expira": int(time.time()) + dias * 86400,
        "limite": limite,
        "usos": 0,
        "ativa": True
    }

    return jsonify({"chave": chave})

# ===== VALIDAR =====
@app.route("/validar")
def validar():
    chave = request.args.get("chave")

    if chave not in CHAVES:
        return jsonify({"status": "erro"})

    dados = CHAVES[chave]

    if not dados["ativa"]:
        return jsonify({"status": "bloqueada"})

    if time.time() > dados["expira"]:
        return jsonify({"status": "expirada"})

    if dados["usos"] >= dados["limite"]:
        return jsonify({"status": "limite"})

    dados["usos"] += 1

    return jsonify({
        "status": "ok",
        "expira": dados["expira"]
    })

# ===== BLOQUEAR =====
@app.route("/bloquear", methods=["POST"])
def bloquear():
    chave = request.json.get("chave")
    if chave in CHAVES:
        CHAVES[chave]["ativa"] = False
    return jsonify({"ok": True})

# ===== LISTAR =====
@app.route("/listar")
def listar():
    return jsonify(CHAVES)

app.run(host="0.0.0.0", port=5000)
