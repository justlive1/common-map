<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Example</title>
		
		<link rel="webjars/theme/default/style.css" />
	</head>
	<body>
		<div id="map" style="width: 1000px;height:600px;"></div>
	
		<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/jquery/jquery-3.2.0.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/OpenLayers/OpenLayers.js"></script>
		<script type="text/javascript" src="webjars/lib/MapTool.js"></script>
		<script type="text/javascript">
			var mapTool;
			
			var config = {
					appCtx: '',
					zoomMaxLevel: 18,
					initLevel: 8,
					initLon: 118.7878785304,
					initLat: 32.0498661326,
					useMapServer: false,
					tools: true,
					rectangle: true,
					irRegular: true,
					rectangleCallback: null,
					irregularCallback: null,
					layerswitcher: true
			};
			
			mapTools = new MapTool('map', config);
			mapTools.init();
			
		</script>
	</body>
</html>