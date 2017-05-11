# map-common
提供地图公共服务


### 依赖当前jar
```xml

```
### 引用css和js
```html
<link rel="${pageContext.request.contextPath }/webjars/theme/default/style.css" />

<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/jquery/jquery-3.2.0.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/OpenLayers/OpenLayers.js"></script>
<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/lib/MapTool.js"></script>
```
### 例子
```html
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>Example</title>
		
		<link rel="${pageContext.request.contextPath }/webjars/theme/default/style.css" />
	</head>
	<body>
		<div id="map" style="width: 1000px;height:600px;"></div>
	
		<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/jquery/jquery-3.2.0.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/syslib/OpenLayers/OpenLayers.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath }/webjars/lib/MapTool.js"></script>
		<script type="text/javascript">
			var mapTool;
			
			var config = {
				//应用根目录
				appCtx : '${pageContext.request.contextPath }',
				//地图最大级别
				zoomMaxLevel : 18,
				//地图初始级别
				initLevel : 8,
				//初始经度
				initLon : 118.7878785304,
				//初始纬度
				initLat : 32.0498661326,
				//是否启用自己的地图服务
				useMapServer : false,
				//开启地图工具功能
				tools : true,
				//开启规则框选功能
				rectangle : true,
				//开启不规则框选功能
				irRegular : true,
				//规则框选回调
				rectangleCallback : function(f) {
					console.log(f);
				},
				//不规则框选回调
				irregularCallback : function(f) {
					console.log(f);
				},
				//开启图层展示
				layerswitcher : true

			};

			mapTools = new MapTool('map', config);
			mapTools.init();
		</script>
	</body>
</html>
```

