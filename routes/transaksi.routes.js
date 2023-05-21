const express = require(`express`)
const app = express()
app.use(express.json())

const transaksiController = require(`../controllers/transaksi.controller`)

app.get("/getTransaksi", transaksiController.getTransaksi)
app.post("/addTransaksi", transaksiController.addTransaksi) 
app.put("/:id_transaksi", transaksiController.updateTransaksi)
app.put("/updateStatus/:id_transaksi", transaksiController.updateStatusTransaksi) 
app.delete("/:id_transaksi", transaksiController.deleteTransaksi)
app.post("/jumlahPendapatan", transaksiController.jumlahPendapatan) 
app.post("/filterTransaksi", transaksiController.filterTransaksi) 

module.exports = app
