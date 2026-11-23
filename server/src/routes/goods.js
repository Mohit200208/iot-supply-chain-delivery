import {Router} from 'express';import {Goods} from '../models.js';import {auth,allow,asyncRoute} from '../middleware.js';const r=Router();r.use(auth);
r.get('/',asyncRoute(async(q,s)=>s.json(await Goods.find().sort({createdAt:-1}))));
r.post('/',allow('Admin','Warehouse Manager'),asyncRoute(async(q,s)=>s.status(201).json(await Goods.create(q.body))));
r.put('/:id',allow('Admin','Warehouse Manager'),asyncRoute(async(q,s)=>s.json(await Goods.findByIdAndUpdate(q.params.id,q.body,{new:true,runValidators:true}))));
r.delete('/:id',allow('Admin','Warehouse Manager'),asyncRoute(async(q,s)=>{await Goods.findByIdAndDelete(q.params.id);s.json({ok:true});}));export default r;
