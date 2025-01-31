# Overview

This document explains the structure of a STAPI **Order** request which is used for placing orders. 

Ordering with loosely defined order values will give the provider more freedom to schedule. Define the values strictly to increase the chance of the preferred capture moment.

## Create Order Request

The following fields can be sent to `POST /orders`:

| Field Name | Type                             | Description                                                  |
| ---------- | -------------------------------- | ------------------------------------------------------------ |
| datetime   | string                           | **REQUIRED.** Two datetimes with a forward slash `/` separator. Datetimes must be formatted to [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6). Open ranges in time intervals at the start or end are supported using a double-dot `..` or an empty string for the start/end. Examples:<br />`2024-04-18T10:56:00+01:00/2024-04-25T10:56:00+01:00`<br />`2024-04-18T10:56:00+01:00/..`<br />`/2024-04-25T10:56:00+01:00` |
| product_id | string                           | **REQUIRED.** Product identifier. The ID should be unique and is a reference to the [parameters](https://github.com/Element84/stat-api-spec/blob/main/product/README.md#parameters) which can be used in the [parameters](https://github.com/Element84/stat-api-spec/blob/main/product/README.md#parameters) field. |
| geometry   | GeoJSON Object \| JSON Reference | **REQUIRED.** Provide a Geometry that the tasked data must be within. |
| filter     | CQL2 JSON                        | A set of additional [parameters](https://github.com/Element84/stat-api-spec/blob/main/product/README.md#parameters) in [CQL2 JSON](https://docs.ogc.org/DRAFTS/21-065.html) based on the [parameters](https://github.com/Element84/stat-api-spec/blob/main/product/README.md#parameters) exposed in the product. |

#### geometry

Provides a GeoJSON Geometry Object, can be an embedded GeoJSON object or a [JSON Reference](https://json-spec.readthedocs.io/reference.html) that resolves to a GeoJSON. In both cases the GeoJSON must be compliant to [RFC 7946, section 3.1](https://tools.ietf.org/html/rfc7946#section-3.1). Coordinates are specified in Longitude/Latitude or Longitude/Latitude/Elevation based on [WGS 84](http://www.opengis.net/def/crs/OGC/1.3/CRS84).

Example for JSON Reference:
```json
{
    "$ref": "https://ogc.features.api/collections/123/items/321"
}
```

### Create Order Response

The response is using HTTP status code 201 and provides the location of the newly created order, which points to `GET /order/{orderId}`.

Example:

```http
HTTP 201 Created
Location: https://example.com/orders/123
```

## GET /orders

### Get Orders Response

| Field Name | Type                      | Description |
| ---------- | ------------------------- | ----------- |
| orders     | \[[Order Object](#order-object)\]          | **REQUIRED.** A list of orders. |
| links      | Map\<object, Link Object> | **REQUIRED.** Links for e.g. pagination. |

If the `GET /orders/{orderId}/status` endpoint is implemented, there must be a link to the endpoint using the relation type `status`.

## GET /orders/\{id\}

### Get Order Response
See [Order Object](#order-object).

## Order Object
| Field Name | Type | Description |
| ---------- | ---- | ----------- |
| id   | string | Unique provider generated order ID |
| user | string | User or organization ID ? |
| created | datetime | When the order was created |
| status | [Order Status Object](#order-status) | Current Order Status object |
| links    | \[[Link Object](https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md#link-object)\] |  |

If the `GET /orders/{orderId}/status` endpoint is implemented, there must be a link to the endpoint using the relation type `monitor`.

## Order Status

| Field Name | Type | Description |
| ---------- | ---- | ----------- |
| timestamp  | datetime | **REQUIRED.** ISO 8601 timestamp for the order status |
| status_code | string | **REQUIRED.** Enumerated status code |
| reason_code | string | Enumerated reason code for why the status was set |
| reason_text | string | Textual description for why the status was set |
| links | \[Link Object\] | **REQUIRED.** list of references to documents, such as delivered asset, processing log, delivery manifest, etc. |

Links is intended to be the same data structure as links collection in STAC. Links will be very provider specific.

### Enumerated status codes

#### Code status codes

* received (indicates order received by provider and it passed format validation.)
* accepted (indicates order has been accepted)
* rejected (indicates order will not be fulfilled)
* completed (indicates provider was able to successfully collect imagery)
* canceled (indicates provider was unable to collect imagery)

Providers must support these statuses.

State machine intent (currently no mandate to enforce)
* Received -> accepted or rejected.
* Accepted -> completed or canceled.

#### Optional status codes

Providers may support these statuses.

* scheduled (indicates order has been scheduled, no longer subject to customer cancellation)
* held (order held for manual review)
* processing (indicates some sort of processing has taken place, such as data was downlinked, processed or delivered)
* reserved (action needed by customer prior to acceptance, such as payment)

#### Extension status codes

Providers may support additional statuses through extensions. For example:

* tasked (indicates tasking commands have been issued to the satellite/constellation)
* user_cancelled (indicates that the user cancelled the request)

### Enumerated reason codes

Code indicating why a status was set.  These are just examples at the moment.  No consensus has been achieved as to what reasons should be core and handled in the same way by all providers, and which should be by extension.

* invalid_geometry (invalid should be renamed, means that a valid geometry failed business rules)
* competition (e.g., failed tasking auction)
* cloud_cover (imagery rejected for cloud coverage)
* partial_delivery (indicates a file was processed and placed in catalog, used with processing)
