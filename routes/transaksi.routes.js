const express = require(`express`)
const app = express()
app.use(express.json())

const transaksiController = require(`../controllers/transaksi.controller`)
const authController = require(`../controllers/auth.controller`)

app.get("/getTransaksi", authController.authorization, transaksiController.getTransaksi)
app.post("/addTransaksi", authController.authorization, transaksiController.addTransaksi)
app.put("/:id_transaksi", authController.authorization, transaksiController.updateTransaksi)
app.put("/updateStatus/:id_transaksi", authController.authorization, transaksiController.updateStatusTransaksi)
app.delete("/:id_transaksi", authController.authorization, transaksiController.deleteTransaksi)
app.post("/jumlahPendapatan", authController.authorization, transaksiController.jumlahPendapatan)
app.post("/filterTransaksi", authController.authorization, transaksiController.filterTransaksi)

app.post("/jumlahPendapatanTanggal", authController.authorization, transaksiController.totalPendapatanTanggal)
app.post("/jumlahPendapatanBulanan", authController.authorization, transaksiController.totalPendapatanBulanan)
app.post("/jumlahPendapatanTahunan", authController.authorization, transaksiController.totalPendapatanTahunan)


module.exports = app
