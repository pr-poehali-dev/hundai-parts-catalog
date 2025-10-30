'''
Business: Admin API to get all orders with items and update order status
Args: event with httpMethod (GET for list, PUT for status update)
Returns: HTTP response with orders list or update confirmation
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        try:
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            cur.execute("""
                SELECT 
                    o.id, o.order_number, o.customer_name, o.customer_phone, 
                    o.customer_email, o.total_amount, o.status, o.created_at,
                    json_agg(
                        json_build_object(
                            'product_name', oi.product_name,
                            'product_vin', oi.product_vin,
                            'product_model', oi.product_model,
                            'price', oi.price,
                            'quantity', oi.quantity
                        )
                    ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            """)
            
            rows = cur.fetchall()
            orders = []
            
            for row in rows:
                orders.append({
                    'id': row[0],
                    'order_number': row[1],
                    'customer_name': row[2],
                    'customer_phone': row[3],
                    'customer_email': row[4],
                    'total_amount': float(row[5]),
                    'status': row[6],
                    'created_at': row[7].isoformat(),
                    'items': row[8]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'orders': orders}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if method == 'PUT':
        try:
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('order_id')
            new_status = body_data.get('status')
            
            if not order_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing order_id or status'}),
                    'isBase64Encoded': False
                }
            
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            cur.execute(
                "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (new_status, order_id)
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Status updated'}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
