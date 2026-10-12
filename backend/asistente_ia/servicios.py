from openai import OpenAI
import os


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def preguntar_openai(pregunta):
    respuesta = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "Eres un asistente inteligente para un sistema hotelero."
            },
            {
                "role": "user",
                "content": pregunta
            }
        ]
    )

    return respuesta.choices[0].message.content