import pymysql as sql
import json
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
	def default(self, o):
		if isinstance(o, datetime):
			return o.isoformat()
		return json.JSONEncoder.default(self, o)

def get_list(event, context):
	connection = sql.connect(
		host = 'sql.camerondevine.me',
		user = 'SpinTransData',
		database = 'MRFM')
	cursor = connection.cursor()
	query = 'SELECT hash, date FROM spin_transport'
	try:
		data = json.loads(event['body'])
	except:
		data = {}
	print data
	if 'where' in data:
		query += ' WHERE {}'.format(data['where'].replace(';', ''))
	if 'order' in data:
		query += ' ORDER BY {}'.format(data['order'].replace(';', ''))
	query += ';'
	cursor.execute(query)
	data = cursor.fetchall()
	cursor.close()
	connection.close()
	return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(data, cls = DateTimeEncoder)}

if __name__ == '__main__':
	import argparse
	parser = argparse.ArgumentParser(
		description = 'Spin Transport get_list function')
	parser.add_argument('-w',
		type = str,
		help = 'The SQL WHERE statement.')
	parser.add_argument('-o',
		type = str,
		help = 'The SQL ORDER BY statement.')
	args = parser.parse_args()
	event = {}
	if args.w:
		event['where'] = args.w
	if args.o:
		event['order'] = args.o
	print get_list(event, None)['body']
