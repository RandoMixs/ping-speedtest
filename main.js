$.getJSON('servers.json', (data) => {
	if(data) {
		data.forEach((server) => {
			if(server['cc'] != "BR") return;
			$('.servers.container').append('<div class="server box" server-id="' + server['id'] + '"><div class="server name">' + server['sponsor'].replace('-','') + '</div><div class="server location">' + server['name'] + '</div><div class="server latency">0 ms</div></div>');
            var connection = new WebSocket('wss://' + server['host'] + '/ws');
			var start, ok = false;
			connection.onopen = function () {
				setInterval(function () {
					if(ok == true) return;
					ok = true;
					start = Date.now();
					connection.send('PING ' + start);
				}, 500);
			};
			connection.onmessage = function (e) {
				if(e['data'].match('PONG')) {
					var latency = (Date.now()) - start;
					$('.server.box[server-id="' + server['id'] + '"] .server.latency').text(latency + ' ms');
					ok = false;
				}
			};
		});
	} else {
		alert('Erro ao carregar a lista de servidores.');
	}
}).fail(() => {
    alert('Erro ao carregar a lista de servidores.');
});