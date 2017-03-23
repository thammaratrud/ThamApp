'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var PaymentSchema = new Schema({
    docno: {
        type: String,
        default: '',
        unique: true,
        required: 'Please fill Payment docno',
        trim: true
    },
    brunch: String,
    taxid: String,
    address: String,
    telofficeno: String,
    remark: String,
    docdate: {
        type: Date,
        default: Date.now
    },
    refno: {
        type: String
    },
    client: {
        type: Schema.ObjectId,
        ref: 'Accountchart'
    },
    items: [{
        product: {
            type: Schema.ObjectId,
            ref: 'Accountchart'
        },
        qty: {
            type: Number
        },
        unitprice: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            default: 0
        },
        vatamount: {
            type: Number,
            default: 0
        },
        whtamount: {
            type: Number,
            default: 0
        },
        totalamount: {
            type: Number,
            default: 0
        }
    }],

    payfor: [{
        paytype: {
            type: Schema.ObjectId,
            ref: 'Accountchart'
        },
        description: String,
        amount: {
            type: Number,
            default: 0
        }
    }],

    payby: [{
        paytype: {
            type: Schema.ObjectId,
            ref: 'Accountchart'
        },
        description: String,
        amount: {
            type: Number,
            default: 0
        },
        totalamount: Number
    }],
    drilldate: {
        type: Date,
    },
    creditday: {
        type: Number
    },
    isincludevat: {
        type: Boolean
    },
    amount: {
        type: Number,
        default: 0
    },
    discountamount: {
        type: Number,
        default: 0
    },
    amountafterdiscount: {
        type: Number,
        default: 0
    },
    vatamount: {
        type: Number,
        default: 0
    },
    whtamount: {
        type: Number,
        default: 0
    },
    totalamountpayby: {
        type: Number,
        default: 0
    },
    totalamountpayfor: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'buy',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Payment', PaymentSchema);