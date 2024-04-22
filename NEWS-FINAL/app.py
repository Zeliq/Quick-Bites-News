from flask import Flask, jsonify, request
import nltk
import re
import datetime
from gtts import gTTS
import google.generativeai as palm
from dotenv import load_dotenv
import requests

app = Flask(__name__)

def news():
    main_url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=8042d64c97454268b324c742555d9ab1"
    news = requests.get(main_url).json()
    articles = news["articles"]
    news_article = []
    news_desc = []

    for arti in articles:
        news_article.append(arti['title'])
        news_desc.append(arti['description'])
    return news_article, news_desc

arti_title, arti_desc = news()

load_dotenv()

palm.configure(api_key='AIzaSyC5ybtTFJqL05pyHffcdr6PJ4OTms0fNaA')

models = [m for m in palm.list_models() if 'generateText' in m.supported_generation_methods]
model = models[0].name

def genResp(text):
    completion = palm.generate_text(
        model=model,
        prompt=text,
        temperature=0,
        max_output_tokens=400
    )
    if isinstance(completion.result, str):
        return completion.result
    else:
        return str(completion.result)

responses = []

def chatWithAI(language):
    today_date = datetime.datetime.now().strftime('%Y-%m-%d')
    question = f"Can you please expand and summarize this news into 5 lines {language} "

    res = re.sub(r"\n", "<br>", genResp(question))
    response = f'<h2>{question}</h2><p>{res}</p>'
    responses.append(res)
    return response

def text_to_speech(text):
    newText = text
    stars = ['**', '*']
    for star in stars:
        newText = newText.replace(star, '')

    icons = ['<br>', '<h2>', '<p>', '</br>', '</h2>', '</p>', '**', '*']
    for icon in icons:
        text = text.replace(icon, '')

    tts = gTTS(text=text, lang='en', slow=False)
    filename = "speech.mp3"
    tts.save(filename)

    return filename, newText

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.json
    responses = chatWithAI(data.get('language'))
    return jsonify({"responses": responses})

if __name__ == '__main__':
    app.run(debug=True)
