'''
Business: CRUD API for products catalog (get all, get by id, search by VIN)
Args: event with httpMethod (GET), queryStringParameters for search
Returns: HTTP response with products list or single product
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        try:
            query_params = event.get('queryStringParameters') or {}
            search_query = query_params.get('search', '')
            model_filter = query_params.get('model', '')
            category_filter = query_params.get('category', '')
            
            database_url = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            sql = "SELECT id, name, vin, category, price, image_url, model, in_stock, description FROM products WHERE 1=1"
            params = []
            
            if search_query:
                sql += " AND (LOWER(name) LIKE %s OR LOWER(vin) LIKE %s)"
                search_param = f"%{search_query.lower()}%"
                params.extend([search_param, search_param])
            
            if model_filter and model_filter != 'all':
                sql += " AND model = %s"
                params.append(model_filter)
            
            if category_filter and category_filter != 'all':
                sql += " AND LOWER(category) = %s"
                params.append(category_filter.lower())
            
            sql += " ORDER BY name"
            
            cur.execute(sql, params)
            rows = cur.fetchall()
            
            products = []
            for row in rows:
                products.append({
                    'id': row[0],
                    'name': row[1],
                    'vin': row[2],
                    'category': row[3],
                    'price': float(row[4]),
                    'image': row[5],
                    'model': row[6],
                    'inStock': row[7],
                    'description': row[8]
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'products': products}),
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