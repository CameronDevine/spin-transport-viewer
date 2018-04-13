var apigClient = apigClientFactory.newClient();

var n = 0;
var rho1 = new Array();
var rho2 = new Array();
var rho3 = new Array();
var x = new Array();
var t = new Array();

var data = {};
var table = Array();
var current_date = '';

get_list = function(){
	console.log('get_list');
	$('#list').html('');
	var body = {};
	var query = $('#builder').queryBuilder('getSQL', false);
	if(query !== null){body['where'] = query.sql};
	apigClient.getListPost({}, body)
		.then(function(result){
			try{
				table = result.data;
				table.unshift(['hash <i class="fa fa-sort" onclick="sort(this)"></i>','date <i class="fa fa-sort" onclick="sort(this)"></i>']);
				create_table();
			}catch(err){
				console.log(err);
			}
		}).catch( function(result){
			console.log('error');
		    $('#list').html('Error');
		});
};

sort = function(icon){
	var header = table[0];
	var icon_index = $(icon).parent().index();
	header.forEach(function(el, index){
		if (index !== icon_index) {
			header[index] = header[index].replace('fa-sort-up', 'fa-sort').replace('fa-sort-down', 'fa-sort');
		}
	});

	var sort_up = true;
	
	if (header[icon_index].includes('fa-sort-up')) {
		header[icon_index] = header[icon_index].replace('fa-sort-up', 'fa-sort-down');
		sort_up = false;
	} else if (header[icon_index].includes('fa-sort-down')) {
		header[icon_index] = header[icon_index].replace('fa-sort-down', 'fa-sort-up');
	} else if (header[icon_index].includes('fa-sort')) {
		header[icon_index] = header[icon_index].replace('fa-sort', 'fa-sort-up');
	}

	table = table.slice(1);
	if (typeof table[icon_index][0] === 'string') {
		var sort_func = function(a, b){return a[icon_index].localeCompare(b[icon_index])}
	} else {
		var sort_func = function(a, b){return a[icon_index] - b[icon_index]}
	}
	table.sort(sort_func);
	if (!sort_up) {table.reverse()}
	table.unshift(header);
	create_table();
}

create_table = function(){
	$('#list').html('');
	var options = {
		thead: true,
		tbody: true,
		attrs: {'class': 'table table-hover table-bordered'}};
	try{
		$('#list').append(arrayToTable(table, options));
		$('#list tr').slice(1).click(get_data);
		add_git_links();
	}catch(err){
		console.log(err);
	}
}

add_git_links = function(){
	$('#list tr').slice(1).each(function(){
		var hash = $(this).children().eq(0).html();
		var url = 'https://github.com/ricopicone/spin-transport/commit/' + hash;
		var link = $('<a>', {
			text: hash.slice(0,7),
			href: url,
			target: '_blank'});
		$(this).children().eq(0).html(link)
	});
};
		

get_data = function(){
	console.log('get_data');
	var date = $(this).children().eq(1).html();
	console.log(date);
	if(date == current_date) {plot_data()}
	else{request_data(date)};
};

request_data = function(date){
	current_date = date;
	Plotly.purge('plot');
	apigClient.getDataPost({}, date)
		.then(function(result){
			console.log(result.data);
			data = result.data;
			try{
				plot_data();
			}catch(err){
				console.log(err);
			}
		}).catch(function(result){
			console.log('error');
		});
};

plot_data = function(){
	console.log('plot_data');
	Plotly.purge('plot');
	$('#replay').show();
	n = 0;
	rho1 = JSON.parse(data['rho1']);
	rho2 = JSON.parse(data['rho2']);
	rho3 = JSON.parse(data['rho3']);
	x = JSON.parse(data['x']);
	t = JSON.parse(data['t']);
	var max_array = new Array();
	var min_array = new Array();
	rho1.concat(rho2).concat(rho3).forEach(function(ell){max_array.push(Math.max.apply(null, ell))})
	rho1.concat(rho2).concat(rho3).forEach(function(ell){min_array.push(Math.min.apply(null, ell))})
	var data_max = Math.max.apply(null, max_array);
	var data_min = Math.min.apply(null, min_array);
	var x_max = Math.max.apply(null, x);
	var x_min = Math.min.apply(null, x);
	Plotly.plot('plot', [
		{x: x, y: rho1[0], name: 'rho1'},
		{x: x, y: rho2[0], name: 'rho2'},
		{x: x, y: rho3[0], name: 'rho3'}
	], {
		xaxis: {range: [x_min, x_max]},
		yaxis: {range: [data_min, data_max]}
	});
	requestAnimationFrame(update_plot);
};

update_plot = function(){
	n += 1;
	Plotly.animate('plot', {
		data: [
			{x: x, y: rho1[n]},
			{x: x, y: rho2[n]},
			{x: x, y: rho3[n]}
		]}, {
			transition: {duration: 0},
			frame: {duration: 50, redraw: false}
		});
	if(n < t.length) {
		requestAnimationFrame(update_plot);
	};
};

init_builder = function(){
	$('#builder').queryBuilder({
		plugins: ['sql-support'],
		filters: [{
			id: 'hash',
			label: 'Git Commit Hash',
			type: 'string'
		},{
			id: 'date',
			label: 'Simulation Date',
			type: 'date'}]});
	window.setTimeout(function(){$('#builder').find('.rule-header').find('button').click()}, 20);
	$('#builder').children().eq(0).attr({style:"margin:auto"});
};

window.onload = function(){
	var get_params = {};
	location.search.substr(1).split('&').forEach(function(ell){
		var param = ell.split('=');
		get_params[param[0]] = param[1];
	});
	console.log(get_params);
	init_builder();
	get_list();
	if('date' in get_params){request_data(get_params['date'])};
};
