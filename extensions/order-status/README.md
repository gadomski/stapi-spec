# Overview

- **Conformance URI:** <https://stapi.example.com/v0.1.0/order-status>

This document explains the structure of a STAT **Order Status** request. Operation returns a list/array of statuses that have affected an order.  The most recent status code is the current status of the order.

The `GET /orders/{orderId}` endpoint must add a link to this endpoint using the relation type `monitor`.

Endpoint: `GET /orders/{id}/status`

## Order Status Request

Get operation only. 

## Order Status Response

Response has two fields:
| Field Name | Type | Description |
| ---------- | ---- | ----------- |
| current | OrderStatus | The current/official status object |
| history | [OrderStatus] | History of statuses |

The [Order Status](../order/README.md#order-status) object is described in the order README.
