import pymysql as sql
import json
from datetime import datetime

columns = [
	'rho1',
	'rho2',
	'rho3',
	't',
	'x']

def get_data(event, context):
	date = datetime.strptime(event['body'], "%Y-%m-%dT%H:%M:%S")
	query = 'SELECT {} FROM spin_transport WHERE date=%s;'.format(', '.join(columns))
	connection = sql.connect(
		host = 'sql.camerondevine.me',
		user = 'SpinTransData',
		database = 'MRFM')
	cursor = connection.cursor()
	cursor.execute(query, (date,))
	data = cursor.fetchone()
	cursor.close()
	connection.close()
	body = {}
	for i in range(len(columns)):
		body[columns[i]] = data[i]
	return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(body)}

if __name__ == '__main__':
	import argparse
	parser = argparse.ArgumentParser(
		description = 'Spin Transport get_data function')
	parser.add_argument('date',
		type = str,
		help = 'The date and time of the simulation in ISO format.')
	args = parser.parse_args()
	print get_data({'date': args.date}, None)['body']
