from flask import Flask
from .routes import route_bp
from flask_cors import CORS  # enable

def create_app():
    app = Flask(__name__)
    # allow your local Next.js and Vercel preview domains
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app"
    ]}}, supports_credentials=True)

    app.config["REDIS_URL"] = "redis://localhost:6379/0"
    app.register_blueprint(route_bp, url_prefix="/api")
    return app