# -*- coding: utf-8 -*-
import os
import re
import settings
import requests

from requests.auth import HTTPBasicAuth
from datetime import datetime
from pymongo import MongoClient
from flask import Flask, render_template, request, jsonify
from wtforms import PasswordField, validators
from wtforms.fields.html5 import EmailField
from flask.ext.wtf import Form
from flask.ext.wtf.recaptcha import RecaptchaField

# Set it to True if you want to set earlypage
MANUAL = True
EARLY_PAGE = False

dbcon = MongoClient(settings.MONGODB_HOST, settings.MONGODB_PORT)
idgen = dbcon['idgen']
idreq = idgen['idreq']
reqip = idgen['reqip']

app = Flask(__name__, static_url_path='')
app.secret_key = 'SOME_SECURE_STRING'
app.config['RECAPTCHA_PUBLIC_KEY'] = "RECAPTCH_PUBLIC_KEY"
app.config[
    'RECAPTCHA_PRIVATE_KEY'] = "RECAPTCH_PRIVATE_KEY"
app.config['RECAPTCHA_PARAMETERS'] = {'hl': 'fa'}

earlypage_endpoint = 'http://EARLYPAGE_ENDPOINT{}'
earlypage_auth = HTTPBasicAuth('PROJECT2_user', 'somesecurepass')
# How many times an IP address can send request
REQ_LIMIT = 3

# Approved email providers list:
EMAIL_PROVIDERS = ['gmail.com', 'outlook.com', 'yahoo.com', 'ymail.com',
                   'aol.com', 'me.com', 'icloud.com', 'mac.com', 'live.com',
                   'hotmail.com']

# DEVELOPMENT STATUS
if os.environ.get("DEVELOPMENT"):
    app.debug = True


def get_client_ip(request):
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0].split(',')[0]
    else:
        ip = request.remote_addr
    return ip


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
        raise validators.ValidationError('Not a valid password')


def email_validator(form, field):
    provider = field.data.split('@')[-1].lower()
    if provider not in EMAIL_PROVIDERS:
        raise validators.ValidationError('Not a valid email provider')


class Registration(Form):
    apple_id = EmailField('Email address: ', [email_validator])
    password = PasswordField(
        'Password: ', [
            validators.Required(), validators.EqualTo(
                'confirm', message="Passwords must match"), password_validator
        ])
    confirm = PasswordField('Confirm: ', [password_validator])
    recaptcha = RecaptchaField()


class Earlypage(Form):
    email = EmailField('Email address: ', [email_validator])


def manual_view():
    return render_template('manual.html')


def earlypage_view():
    form = Earlypage()
    if request.method == 'POST':
        email = form.data['email']

        endpoint = earlypage_endpoint.format('welcome')
        params = {'email': email,
                  'share_url': 'http://id.PROJECT.ir/?ref_id={{ref_id}}'}

        if 'ref_id' in form.data:
            params['referrer'] = form.data['ref_id']

        res = requests.get(endpoint, auth=earlypage_auth, params=params)

        if res.status_code == 200:
            res = res.json()
            return jsonify(
                done=True, share=res['share_url'], ql=res['queue_length'])
        else:
            return jsonify(done=False)

    return render_template('earlypage.html', form=form)


def defautl_view():
    form = Registration()
    if request.method == 'POST':
        # Check IP to limit requests
        user_ip = get_client_ip(request)
        date = str(datetime.now().date())
        ip_try_count = reqip.find_one({'ip': user_ip,
                                       'date': date,
                                       'count': {'$gte': REQ_LIMIT}})
        if ip_try_count:
            return jsonify(
                done=False,
                error="تعداد درخواست شما برای ثبت اپل‌آیدی از حد مجاز گذشته است.")

        # Increment user try count for IP address per date
        reqip.update({'ip': user_ip,
                      'date': date}, {'$set': {'ip': user_ip,
                                               'date': date},
                                      '$inc': {'count': 1}}, True)

        # Do form validation and submit request
        if form.validate_on_submit():
            apple_id = form.data['apple_id'].lower()
            password = form.data['password']

            req_exists = idreq.find_one({'apple_id': apple_id,
                                         'recoverable': 0})
            if req_exists:
                return jsonify(
                    done=False,
                    error="درخواست شما برای این شناسه ایمیل قبلا ثبت شده است.")
            # Write data to database
            idreq.update(
                {'apple_id': apple_id},
                {'apple_id': apple_id,
                 'password': password,
                 # User is not allowed to register except we set it to 1
                 'recoverable': 0,
                 # System will try 3 times to create ID.
                 'retry': 0},
                upsert=True)

            return jsonify(done=True)
        else:
            return jsonify(
                done=False, error="اطلاعات وارد شده برای درخواست نامعتبر است.")
    return render_template('index.html', form=form)


@app.route('/', methods=['GET', 'POST'])
def index():
    if MANUAL:
        return manual_view()
    elif EARLY_PAGE:
        return earlypage_view()
    else:
        return defautl_view()


if __name__ == '__main__':
    app.run()
