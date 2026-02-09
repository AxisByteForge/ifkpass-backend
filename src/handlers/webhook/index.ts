import { APIGatewayProxyEvent } from 'aws-lambda';
import { getPayment } from '@/infra/mercado-pago/mercado-pago.service';
import { payCard } from '@/services/pay-card/pay-card.service';

function extractPaymentId(
  event: APIGatewayProxyEvent,
  body: any
): string | null {
  if (body?.data?.id) return body.data.id as string;
  if (event.queryStringParameters?.id) return event.queryStringParameters.id;
  if (event.queryStringParameters?.['data.id']) {
    return event.queryStringParameters['data.id'];
  }
  return null;
}

async function mercadoPagoWebhook(event: APIGatewayProxyEvent) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const paymentId = extractPaymentId(event, body);

    if (!paymentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Payment identifier not provided.'
        })
      };
    }

    const payment = await getPayment(paymentId);

    if (!payment.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Payment without associated user.'
        })
      };
    }

    const result = await payCard({
      userId: payment.userId,
      action: 'complete-payment',
      paymentStatus: payment.status,
      paymentId
    });

    if (result.isLeft()) {
      const { reason, statusCode } = result.value;
      return {
        statusCode,
        body: JSON.stringify({ message: reason })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment synchronized successfully.',
        result: result.value
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message:
          error instanceof Error
            ? error.message
            : 'Internal error processing Mercado Pago webhook.'
      })
    };
  }
}

export { mercadoPagoWebhook };
