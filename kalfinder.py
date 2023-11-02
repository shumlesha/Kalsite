from docx import Document
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

doc = Document("мудрый баобаб.docx")


def read():
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip() != ""]


    questions = []
    answers = []
    current_answer = []

    for p in doc.paragraphs:

        if p.runs and (p.runs[0].bold and p.runs[0].underline or "Какие ограничения целостности" in p.text):

            if current_answer:

                answers.append("\n".join(current_answer))
                current_answer = []
            questions.append(p.text)
        else:

            if p.runs[0].font.name != "Arial":
                current_answer.append(p.text)

    answers.pop(0)

    if current_answer:
        answers.append("\n".join(current_answer))



    return dict(zip(questions, answers))

res = read()
q = list(res.keys())




def fastananlyzer(usermessage):

    return [[el[0], res[el[0]]] for el in process.extract(usermessage, q, limit=3)]
