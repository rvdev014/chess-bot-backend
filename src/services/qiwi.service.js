import QiwiBillPaymentsAPI from "@qiwi/bill-payments-node-js-sdk";
import uuid from 'uuid';
import {PaymentLog} from "../models/models.ts";

const qiwiApi = new QiwiBillPaymentsAPI(process.env.QIWI_API_KEY);

const params = {
    publicKey: process.env.QIWI_PUBLIC_KEY,
    amount: 200,
    billId: uuid.v4(),
    successUrl: 'https://merchant.com/payment/success?billId=893794793973'
};

const link = qiwiApi.createPaymentForm(params);

const payment = async (user) => {
    const fields = {
        amount: 1.00,
        currency: 'RUB',
        comment: 'test',
        expirationDateTime: '2018-03-02T08:44:07',
        email: 'example@mail.org',
        account : user.user_id,
        successUrl: 'https://t.me/yourroflbot?qiwi=true'
    };
    const billId = uuid.v4();

    await qiwiApi.createBill( billId, fields ).then( async data => {
        console.log(data)
        await PaymentLog.create({
            uuid: data.uuid,
            entity: 'qiwi',
            status: data.status.value,
            data
        })
    });
}

const paymentStatus = async (billId) => {

    await qiwiApi.getBillInfo(billId).then( async data => {
        console.log(data)
        await PaymentLog.create({
            uuid: data.uuid,
            entity: 'qiwi',
            status: data.status.value,
            data
        })
    });
}
