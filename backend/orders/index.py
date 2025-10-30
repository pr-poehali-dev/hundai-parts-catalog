'''
Business: Handles order creation and saves order data to database
Args: event with httpMethod, body containing customer info and items
Returns: HTTP response with order number and status
'''

import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            
            customer_name = body_data.get('customer_name')
            customer_phone = body_data.get('customer_phone')
            customer_email = body_data.get('customer_email', '')
            items = body_data.get('items', [])
            total_amount = body_data.get('total_amount', 0)
            
            if not customer_name or not customer_phone or not items:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            order_number = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            cur.execute(
                "INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, total_amount, status) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (order_number, customer_name, customer_phone, customer_email, total_amount, 'pending')
            )
            order_id = cur.fetchone()[0]
            
            for item in items:
                cur.execute(
                    "INSERT INTO order_items (order_id, product_name, product_vin, product_model, price, quantity) "
                    "VALUES (%s, %s, %s, %s, %s, %s)",
                    (order_id, item['product_name'], item['product_vin'], item['product_model'], 
                     item['price'], item['quantity'])
                )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'order_number': order_number,
                    'order_id': order_id
                }),
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
