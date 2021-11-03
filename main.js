$.getJSON('servers.json', (data) => {
	if(data) {
		function e() {$('.server.box[server-id="' + server['id'] + '"] .server.latency').text('? ms').css('background','#ffb2b4')}
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
			connection.onerror = e;
			connection.onclose = e;
			connection.onmessage = function (e) {
				if(e['data'].match('PONG')) {
					var latency = (Date.now()) - start;
					$('.server.box[server-id="' + server['id'] + '"] .server.latency').text(latency + ' ms').css('background',(latency > 100 ? '#ffb2b4' : (latency > 50 ? '#ffe8bd':'#fff')));
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