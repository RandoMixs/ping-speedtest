var arr = [];
$.getJSON(((window.location.search).split('server=')[1]=="claro"?'servers-claro.json':'servers.json', (data) => {
	if(data) {
		data.forEach((server, i) => {
			if(server['cc'] != "BR") return;
			$('.servers.container').append(`<div class="server box" server-id="${server.id}"><div class="server name">${server.sponsor.replace('-','')}</div><div class="server location">${server.name}</div><div class="server latency" style="background:#ffb2b4">? ms</div></div>`);
			arr[i] = {
				'reconnect': 0,
				'func': function () {
					var connection = new WebSocket(`wss://${server.host}/ws`);
					var start, ok = false;
					connection.onopen = function () {
						arr[i]['reconnect'] = 0;
						setInterval(function () {
							if(ok == true) return;
							ok = true;
							start = Date.now();
							connection.send('PING '+start);
						}, 500);
					};
					connection.onerror = function () {$(`.server.box[server-id="${server.id}"] .server.latency`).text('? ms').css('background','#ffb2b4');arr[i]['reconnect']++;if(arr[i]['reconnect']<=5){arr[i]['func']()}else{$(`.server.box[server-id="${server.id}"] .server.latency`).css('background','#ff8589')}};
					connection.onclose = function () {$(`.server.box[server-id="${server.id}"] .server.latency`).text('? ms').css('background','#ffb2b4');arr[i]['reconnect']++;if(arr[i]['reconnect']<=5){arr[i]['func']()}else{$(`.server.box[server-id="${server.id}"] .server.latency`).css('background','#ff8589')}};
					connection.onmessage = function (e) {
						if(e['data'].match('PONG')) {
							var latency = (Date.now()) - start;
							$(`.server.box[server-id="${server.id}"] .server.latency`).text(`${latency} ms`).css('background',(latency>100?'#ffb2b4':(latency>50?'#ffe8bd':'#fff')));
							ok = false;
						}
					};
				}
			};
		});
		for (i = 0; i < arr.length; i++) {
			arr[i]['func']();
		};
	} else {
		alert('Erro ao carregar a lista de servidores.');
	}
}).fail(() => {
    alert('Erro ao carregar a lista de servidores.');
});