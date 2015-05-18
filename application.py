import re
import settings

from pymongo import MongoClient
from flask import Flask, render_template, request, jsonify
from flask_wtf import Form, RecaptchaField
from wtforms import PasswordField, validators
from wtforms.fields.html5 import EmailField

dbcon = MongoClient(settings.MONGODB_HOST, settings.MONGODB_PORT)
idgen = dbcon['idgen']
idreq = idgen['idreq']

app = Flask(__name__, static_url_path='')
app.secret_key = 'SOME_SECURE_STRING'
app.debug = True
app.config['RECAPTCHA_PUBLIC_KEY'] = "RECAPTCH_PUBLIC_KEY"
app.config['RECAPTCHA_PRIVATE_KEY'] = "RECAPTCH_PRIVATE_KEY"


def password_validator(form, field):
    # At least one lower case character
    # At least one capital character
    # At least one number
    # At least 8 character length
    style_re = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$')
    # Contains more than a consecutive character
    consecutive_re = re.compile(r'(\w)\1{2,}')
    upass = field.data
    if not style_re.match(upass) or consecutive_re.match(upass):
        raise


class Registration(Form):
    apple_id = EmailField('Email address: ')
    password = PasswordField('Password: ', [
        validators.Required(),
        validators.EqualTo('confirm', message="Passwords must match"),
        password_validator])
    confirm = PasswordField('Confirm: ', [password_validator])
    # recaptcha = RecaptchaField()


@app.route('/', methods=['GET', 'POST'])
def index():
    form = Registration()
    if request.method == 'POST':
        print(form.data)
        try:
            form.validate_on_submit()

            apple_id = form.data['apple_id']
            password = form.data['password']

            idreq.update({'apple_id': apple_id},
                         {'apple_id': apple_id,
                          'password': password},
                         upsert=True)

            return jsonify(done=True)
        except:
            return jsonify(done=False)
    else:
        return render_template('index.html', form=form)

if __name__ == '__main__':
    app.run()