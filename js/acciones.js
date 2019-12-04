// JavaScript Document
$(document).ready(function() {
	document.addEventListener("deviceready",function(){
	<plugin spec="https://github.com/triceam/LowLatencyAudio" source="git" />
	audio = window.plugins.LowLatencyAudio;	
	audio.preloadFX('error', 'recursos/sonidos/error.mp3', function(msg){}, function(msg){ alert( 'Error: ' + msg ); });	
	audio.preloadFX('fail', 'recursos/sonidos/fail.mp3', function(msg){}, function(msg){ alert( 'Error: ' + msg ); });	
	audio.preloadFX('win', 'recursos/sonidos/win.mp3', function(msg){}, function(msg){ alert( 'Error: ' + msg ); });
	audio.preloadFX('acierto', 'recursos/sonidos/acierto.mp3', function(msg){}, function(msg){ alert( 'Error: ' + msg ); });


	var abecedario= ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	var oportunidades = 0;
	var palabra_oculta = "";
	var palabra_actual= "";
	var temporal = "";
	var posicion_actual = 0;
	var letra_actual = 0;
	var encontradas  = 0;
	var palabras = []; 
	
	$('#btn-enviar').on('click',function(){
		//alert ($('#selcoleccion').val() + " " +$('#selcuantas').val()+ " " +$('#txtip').val());
		$('#contenedor_letras').hide();
		$('#contendor_reiniciar').hide();
		obtenerpalabras();
	});//enviar
	
	function obtenerpalabras () {
		$.when($.post("http://" + $('#txtip').val() + "/ahorcado/obtenerpalabras.php",{cual: $('#selcoleccion').val(), cuantas: $('#selcuantas').val()})).then(function exito(datos){
				palabras.empty;
				palabras=JSON.parse(datos);
				$('#boton_ip').show();
				$('#seleccion-opciones').hide();
				$.mobile.changePage("index.html#jugar", {transition: "slidedown", changeHash: false});
		}, function error(){
			alert("Error, No se pudo enviar la informacion. Intenta de nuevo, revise su conexion.");
		});		
	}
	
	function obtenercolecciones(txtip) {
		return $.post("http://" + txtip + "/ahorcado/obtenercolecciones.php", function(){});
	}
	
	$('#btn-buscar-colecciones').on('click',function(){
		$('#cargando').show();
		$.when(obtenercolecciones($('#txtip').val())).then(function successHandler(datos){var arreglo=JSON.parse(datos);
		
			for(var i=0; i<arreglo.length; i++){
				var option = new Option(arreglo[i].coleccion, arreglo[i].coleccion);
				$('#selcoleccion').append(option);
			}
			
			$('#boton_ip').hide();
			$('#selcoleccion').trigger("change");
			$('#cargando').hide();
			$('#seleccion-opciones').show();
			
		},function errorHandler(){
			$('#cargando').hide();
			alert("Error: No se encontro ninguna coleccion. [666999]");
			$('#boton_ip').show();
		});
		return false;
    });//clickbtn
	
	function inicializar_variables(){
		encontrada = 0;
		oportunidades = 6;
		temporal = "";
		posicion_actual = 0;
		letra_actual = 0;
		palabra_oculta = palabras[encontrada].textoPalabra.toUpperCase();
		palabra_actual = ocultar_palabra(palabra_oculta);
		$('#imagen').attr('src','images/' + oportunidades + '.png');
		$('#palabra').text(palabra_actual);
		$('#actual').text(abecedario[posicion_actual]);
	}
	
	$('#btn_comenzar').on('click', function(){
		$('#contenedor_letras').show();
		$('#palabra').show();
		$('#contendor_reiniciar').hide();
		inicializar_variables();
	});
	
	function ocultar_palabra(palabra){
		palabra_actual = "";
		for (var x=0; x<palabra.length; x++){
			if(abecedario.includes(palabra.charAt(x)))
				{
					palabra_actual = palabra_actual + "_";
				}
			else
				{
					palabra_actual = palabra_actual + palabra.charAt(x);
				}
			}
		return palabra_actual;
	}
	
	$('#anterior').on('click', function(){
		if (posicion_actual > 0)
		{
			posicion_actual = posicion_actual - 1;
		}
		else
		{
			posicion_actual = 26;
		}
		$('#actual').text(abecedario[posicion_actual]);
	});
	
	$('#siguiente').on('click', function(){
		if (posicion_actual < 26)
		{
			posicion_actual = posicion_actual + 1;
		}
		else
		{
			posicion_actual = 0;
		}
		$('#actual').text(abecedario[posicion_actual]);
	});
	
	$('#actual').on('click', function(){
		letra_actual = $('#actual').html();
		temporal = "";
		for (var y=0; y<palabra_oculta.length; y++)
		{
			if (abecedario.includes(palabra_oculta.charAt(y)))
			{
				if (palabra_oculta.charAt(y)==letra_actual.charAt(0))
				{
					temporal = temporal + letra_actual;
					//audio.play('acierto');
				}
				else
				{
					temporal = temporal + palabra_actual.charAt(y);
				}
			}
			else
			{
				temporal = temporal + palabra_oculta.charAt(y);
			}
		}
		
		$('#palabra').html(temporal);
		
		if (palabra_actual != temporal) //acierto
		
		{
			palabra_actual = temporal;
			if (palabra_oculta == palabra_actual)
			{
			alert("Felicidades! No eres completamente inutil!");
			//audio.play('win');
			$('#contenedor_letras').hide();
			$('#contendor_volver').show();
			encontradas = encontradas + 1;
			$('#encontradas').text(encontradas);
			//win
			
			}
		}
	
		else
		{
			oportunidades = oportunidades - 1;
			//audio.play('error');
			$('#imagen').attr('src','images/' + oportunidades + '.png');
			if (oportunidades<=0)
			{
				
				$('#contenedor_letras').hide();
				$('#palabra').hide();
				//audio.play('fail');
				alert("SMH");
				$('#contendor_reiniciar').show();
				//fin
			}
		}
	});
	
		
	
	$('#btn_reiniciar').on('click', function(){
		$('#contendor_reiniciar').hide();
		$.when($.post("http://" + $('#txtip').val() + "/ahorcado/obtenerpalabras.php",{
			cual: $('#selcoleccion').val(), cuantas: $('#selcuantas').val()})).then(function exito(datos){alert ("Buena suerte"); 
			palabras.empty;
			palabras=JSON.parse(datos);
			$('#btn_comenzar').trigger("click"); });
			$('#contenedor_letras').show();
	});
	
	$('#btn_volver').on('click', function(){
		$('#contendor_volver').hide();
		$.when($.post("http://" + $('#txtip').val() + "/ahorcado/obtenerpalabras.php",{
			cual: $('#selcoleccion').val(), cuantas: $('#selcuantas').val()})).then(function exito(datos){alert ("Diviertete!"); 
			palabras.empty;
			palabras=JSON.parse(datos);
			$('#btn_comenzar').trigger("click"); });
			$('#contenedor_letras').show();
	});
	});//dev ready
}); //ready