const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subAdminSchema = new Schema(   
    {
         userEdit:            {type:Boolean, default: false}, userView:            {type:Boolean, default: false},
         contentEdit:         {type:Boolean, default: false}, contentView:         {type:Boolean, default: false},
         analyticsEdit:       {type:Boolean, default: false}, analyticsView:       {type:Boolean, default: false},
         notificationEdit:    {type:Boolean, default: false}, notificationView:    {type:Boolean, default: false},
         cmsEdit:             {type:Boolean, default: false}, cmsView:             {type:Boolean, default: false},
         subAdminEdit: {type:Boolean, default: false}, subAdminView: {type:Boolean, default: false},
         commentEdit:         {type:Boolean, default: false}, commentView:         {type:Boolean, default: false},

         subAdminId:          {type: Schema.Types.ObjectId  , ref: "admin" },
         isDeleted :          {type:Boolean, default: false}

},

{
    timestamps: true,
    toObject  : {virtuals:true},
    toJSON    : {virtuals:true}
}

);
const subadmin = mongoose.model('subadmin', subAdminSchema);
module.exports = subadmin;