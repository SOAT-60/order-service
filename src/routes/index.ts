import cors from "cors";
import { Router } from "express";
import { container } from "../infra/DI/container";
import { OrderController } from "../controller";
import { safeJsonParse } from "../utils/parser.util";

const router = Router();
router.use(cors);

router.get("/", async (req, res) => {
  return res.status(200).json({ message: "Orders server is up!" });
});

router.post("/order/create", async (req, res) => {
  try {
    const body = req.body;
    const orderController = container.get<OrderController>("OrderController");

    const order = await orderController.createOrder(body);

    if (order) {
      res.status(200).json({
        message: "Pedido criado com sucesso",
        response: { orders: order.order, errorItems: order.errors },
      });
      return;
    }

    res.status(500).json({ message: "Erro ao criar" });
  } catch (error: any) {
    const decodedError = error?.message ? safeJsonParse(error.message) : null;

    if (decodedError) {
      res.status(decodedError.status).json({ message: decodedError.message });
      return;
    }

    res.status(500).json({ message: "Erro ao criar pedido" });
  }
});

router.get("/order/list", async (req, res) => {
  try {
    const orderController = container.get<OrderController>("OrderController");
    const orders = await orderController.listOrders();
    res
      .status(200)
      .json({ message: "produtos listados com sucesso!", response: orders });
  } catch (error: any) {
    const decodedError = error?.message ? safeJsonParse(error.message) : null;

    if (decodedError) {
      res.status(decodedError.status).json({ message: decodedError.message });
      return;
    }

    res.status(500).json({ message: "Erro ao listar pedido" });
  }
});

router.get("/order/get-payment-status/:code", async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ message: "Obrigatório o envio do ID do pedido!" });
    }

    const orderController = container.get<OrderController>("OrderController");
    const orderStatus = await orderController.getPaymentStatus(code);
    res.status(200).json({
      message: "Status recuperado com sucesso",
      response: { status: orderStatus },
    });
  } catch (error: any) {
    const decodedError = error?.message ? safeJsonParse(error.message) : null;

    if (decodedError) {
      res.status(decodedError.status).json({ message: decodedError.message });
      return;
    }

    res.status(500).json({ message: "Erro ao encontrar pedido" });
  }
});

export const routes = router;
