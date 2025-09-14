let activeConnections = [];
let activeIntervals = [];
let currentSession = 0;

function closeAllConnections() {
	activeConnections.forEach(ws => {
		try { ws.close(); } catch(e){}
	});
	activeConnections = [];
	activeIntervals.forEach(id => clearInterval(id));
	activeIntervals = [];
	currentSession++;
}


function loadServers(provider) {
	closeAllConnections();
	var arr = [];
	$(".server-container").empty();
	if (!provider) return;
	const sessionToken = currentSession;
	$.getJSON(`servers/${provider}.json`, async data => {
		if(sessionToken !== currentSession) return; // abort if not latest
		if(data) {
			var tratamento = function (i,server) {
				if(sessionToken !== currentSession) return;
				$(`.server.box[server-id="${server.id}"]`).css('opacity','.5').find('.latency').text('? ms').css('background','#ffb2b4');
				arr[i]['reconnect']++;
				if(arr[i]['reconnect'] <= 5){
					arr[i]['func']()
				} else {
					$(`.server.box[server-id="${server.id}"] .latency`).css('background','#ff8589')
				}
			};

			for await(let [i, server] of Object.entries(data)) {
				if(sessionToken !== currentSession) return;
				$('.server-container').append(`<div class="server box" server-id="${server.id}"><div class="location"><img src="flags/${server.cc}.svg" alt="${server.cc}"><span>${server.name}</span></div><div class="latency" style="background:#ffb2b4">? ms</div></div>`);
				arr[i] = {
					'reconnect': 0,
					'func': function () {
						if(sessionToken !== currentSession) return;
						var connection = new WebSocket(`wss://${server.host}/ws`);
						activeConnections.push(connection);
						var start, ok = false;
						connection.onopen = function () {
							if(sessionToken !== currentSession) { try{connection.close();}catch(e){}; return; }
							arr[i]['reconnect'] = 0;
							var intervalId = setInterval(function () {
								if(sessionToken !== currentSession) { clearInterval(intervalId); try{connection.close();}catch(e){}; return; }
								if(ok == true) return;
								ok = true;
								start = Date.now();
								connection.send('PING '+start);
							}, 500);
							activeIntervals.push(intervalId);
						};
						connection.onerror = () => { if(sessionToken === currentSession) tratamento(i,server); };
						connection.onclose = () => { if(sessionToken === currentSession) tratamento(i,server); };
						connection.onmessage = function (e) {
							if(sessionToken !== currentSession) return;
							if(e['data'].match('PONG')) {
								var latency = (Date.now()) - start;
								$(`.server.box[server-id="${server.id}"]`).css('opacity','1').find('.latency').text(`${latency} ms`).css('background', (latency > 80 ? '#ffb2b4' : (latency > 50 ? '#ffe8bd' : '#fff')));
								ok = false;
							}
						};
					}
				};
			}

			for (i = 0; i < arr.length; i++) {
				if(arr[i] && typeof arr[i]['func'] === "function") arr[i]['func']();
			};
		} else {
			alert('Erro ao carregar a lista de servidores.');
		}
	}).fail(() => {
		if(sessionToken === currentSession) alert('Erro ao carregar a lista de servidores.');
	});
}

$(document).ready(function() {
	var initial = $('#server-select').val();
	loadServers(initial);
	$('#server-select').on('change', function() {
		loadServers(this.value);
	});

	var hideTimeout;
	function isDesktop() {
		return window.matchMedia('(pointer: fine)').matches && $(window).width() > 900;
	}
	function hideSelect() {
		if (isDesktop()) {
			$('.container').css('gap', '0px');
			$('.server-select').css('height', '0px');
		}
	}
	function showSelect() {
		$('.container').css('gap', '18px');
		$('.server-select').css('height', '128px');
	}
	function resetHideTimer() {
		if (!isDesktop()) return;
		showSelect();
		clearTimeout(hideTimeout);
		hideTimeout = setTimeout(hideSelect, 3000);
	}

	if (isDesktop()) {
		$(document).on('mousemove', resetHideTimer);
		resetHideTimer();
	}

	$(window).on('resize', function() {
		if (isDesktop()) {
			showSelect();
			resetHideTimer();
		} else {
			$('.server-select').show();
			clearTimeout(hideTimeout);
		}
	});
});