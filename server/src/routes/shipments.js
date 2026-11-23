import {Router} from 'express';import {Shipment} from '../models.js';import {auth,allow,asyncRoute} from '../middleware.js';const r=Router();r.use(auth);
r.get('/',asyncRoute(async(q,s)=>s.json(await Shipment.find().populate('goods device').sort({createdAt:-1}))));
r.post('/',allow('Admin','Logistics Manager'),asyncRoute(async(q,s)=>{const doc=await Shipment.create({...q.body,trackingCode:q.body.trackingCode||`SHP-${Date.now().toString(36).toUpperCase()}`});s.status(201).json(await doc.populate('goods device'));}));
r.put('/:id',allow('Admin','Logistics Manager'),asyncRoute(async(q,s)=>s.json(await Shipment.findByIdAndUpdate(q.params.id,q.body,{new:true,runValidators:true}).populate('goods device'))));
r.delete('/:id',allow('Admin','Logistics Manager'),asyncRoute(async(q,s)=>{await Shipment.findByIdAndDelete(q.params.id);s.json({ok:true});}));export default r;
