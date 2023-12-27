import fs from "fs";

export function afterPayment(request, res) {

    fs.writeFileSync(`donates/request-${new Date().getTime()}.json`, JSON.stringify({
        "query": request?.query,
        "params": request?.params,
        "status": request?.status,
        "ip": request?.ip,
        "addr": request?.socket.remoteAddress,
        "headers": request?.headers,
    }), 'utf8')

    //
    // const payment = await PaymentLog.findOne({ where: { user_id: ctx.from.id, status: 'new' } })
    //     .then(function(obj) {
    //         const values = {
    //             "status": "new",
    //             "user_id": ctx.from.id,
    //             "uuid": data.payment,
    //             "entity": "payok",
    //             "data": data
    //         }
    //
    //         if(obj)
    //             return obj.update(values);
    //
    //         return PaymentLog.create(values);
    //     })

    return res?.end(
        JSON.stringify({
            "success": "end"
        })
    )
}