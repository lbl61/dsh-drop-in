# dsh-drop-in

> 馃寪 English: [README.md](README.md)

鎶婄郴缁熸枃浠剁鐞嗗櫒閲岀殑鏂囦欢鐩存帴鎷栬繘 DeepSeek Harness Web 鐣岄潰銆傛枃浠朵細鏄剧ず鍦ㄨ緭鍏ユ涓婃柟鐨?鏂囦欢鏍忛噷锛屽彂閫佹秷鎭椂闅忔秷鎭竴璧峰彂鍑猴紙鍚?*缁濆璺緞**锛夛紝骞跺湪姘旀场涓覆鏌撴垚婕備寒鐨勬枃浠跺崱鐗囥€?鍔╂墜璇诲彇鐨勬槸鐪熷疄璺緞鈥斺€斾笉涓婁紶銆佷笉澶嶅埗鍐呭銆?
![鏂囦欢鏍忎笌娑堟伅鍗＄墖](assets/screenshots/screenshot-1.png)
![娑堟伅姘旀场涓殑鏂囦欢鍗＄墖](assets/screenshots/screenshot-2.png)

## 鐗规€?
- 馃柋锔?鎷栧叆**浠绘剰鏂囦欢/鏂囦欢澶?*锛堝浘鐗囦篃鎸夋枃浠跺鐞嗏€斺€斿畼鏂?鎷栧浘鐗?閬僵涓嶅啀鎶㈠崰鎷栨嫿锛?- 馃搶 杈撳叆妗嗕笂鏂规枃浠舵爮锛氬浘鏍?+ 鍚嶇О + 澶у皬 + 璺緞鐘舵€侊紝鍙崟鐙Щ闄わ紙脳锛夛紝鑷姩鍘婚噸
  锛堝悓璺緞 / 鍚嶇О+澶у皬+淇敼鏃堕棿 鐩稿悓涓嶉噸澶嶆坊鍔狅級
- 鉁夛笍 鍙戦€佹秷鎭椂鑷姩闄勫甫 `馃搸 鎷栧叆鏂囦欢` 鍧楋紙鍚嶇О銆佸ぇ灏忋€?*缁濆璺緞**锛夛紝姘旀场娓叉煋涓?  鏂囦欢鍗＄墖锛屾偓鍋滃彲鐪嬪畬鏁磋矾寰?- 馃敡 鎻愪緵 `dropped_files` 宸ュ叿锛屽姪鎵嬪彲闅忔椂璇诲彇灏氭湭鍙戦€佺殑鎷栧叆鏂囦欢
- 馃枼锔?DSH Desktop锛圗lectron锛変笅缁濆璺緞鏉ヨ嚜 preload 灏忔ˉ
  锛坄webUtils.getPathForFile`锛屾柊鐗?Electron 鍞竴鍙栬矾寰勬柟寮忥級
- 馃寪 鍏滃簳锛氭櫘閫氭祻瑙堝櫒锛堟棤 preload 妗ワ級涓嬶紝灏忔枃鏈枃浠朵細澶嶅埗鍒板伐浣滃尯 `.dsh-drops/`锛?  鍔╂墜浠嶅彲璇诲彇

## 瀹夎

```sh
dsh plugin --profile web add https://github.com/lbl61/dsh-drop-in/archive/refs/tags/v1.1.1.tar.gz
```

鎴栨墜鍔ㄥ畨瑁咃紙bundle 褰㈡€侊級锛?
1. 瑙ｅ帇 `dsh-drop-in` 鍒?`~/.dsh/profiles/web/node_modules/dsh-drop-in/`
2. 鍦?`~/.dsh/profiles/web/package.json` 鐨?`dsh.profile.bundles` 鏁扮粍鍔犲叆
   `"dsh-drop-in"`
3. 閲嶅惎 `dsh web`锛圖SH Desktop锛氬畬鍏ㄩ€€鍑哄啀鎵撳紑锛屾垨鍦?DevTools 鎺у埗鍙版墽琛?   `window.dshDesktop.restartService()`锛?
## 浣跨敤

1. 浠庤祫婧愮鐞嗗櫒鎶婃枃浠舵嫋杩涜亰澶╅〉
2. 杈撳叆妗嗕笂鏂瑰嚭鐜版枃浠舵爮锛屾樉绀哄皢瑕侀檮甯︾殑鍐呭
3. 杈撳叆娑堟伅骞跺彂閫侊紙鍥炶溅鎴栧彂閫佹寜閽級
4. 娑堟伅姘旀场涓樉绀烘枃浠跺崱鐗団€斺€斿姪鎵嬪湪娑堟伅閲岀洿鎺ユ嬁鍒扮粷瀵硅矾寰勶紝鍙敤鑷繁鐨勫伐鍏疯鍙栨枃浠?
## 宸ヤ綔鍘熺悊

- 瀹㈡埛绔崐鍦ㄦ崟鑾烽樁娈垫嫤鎴枃浠舵嫋鎷斤紙瀹樻柟鍥剧墖涓婁紶娴佺▼涓嶄細鎶㈣蛋浜嬩欢锛夛紝缁存姢鎸変細璇濋殧绂荤殑
  鏂囦欢鏍忥紙`conversation.input.dock`锛夛紝鐢ㄦ枃浠跺崱鐗囨覆鏌撶敤鎴锋秷鎭皵娉?  锛坄conversation.chat.node` 鐨?`user` key锛夛紝骞跺湪鎻愪氦鍓嶆妸 `馃搸 鎷栧叆鏂囦欢` 鍧楁嫾杩?  draft锛堝洖杞﹀拰鍙戦€佹寜閽袱鏉¤矾寰勯兘瑕嗙洊锛?- 瀹夸富鍗婄淮鎶ゆ寜浼氳瘽鐨勬枃浠剁櫥璁拌〃锛岄€氳繃 `dropped_files` 宸ュ叿鎻愪緵缁欏姪鎵嬶紱锛堟祻瑙堝櫒鍏滃簳鏃讹級
  鎶婃枃鏈枃浠跺啓鍏?`.dsh-drops/<sessionId>/`
- DSH Desktop 涓嬬粷瀵硅矾寰勪緷璧?preload 妗ワ紙瑙?[preload-bridge.md](preload-bridge.md)锛夛細
  Electron 鈮?32 宸茬Щ闄?`File.path`锛岃繖鏄敮涓€鑳芥嬁鍒扮湡瀹炶矾寰勭殑鏂瑰紡

## 閰嶇疆

| 璁剧疆椤?| 璇存槑 |
| --- | --- |
| `enabled` | 鎬诲紑鍏筹紙璁剧疆 鈫?鏂囦欢鎷栧叆锛夈€傚叧闂悗鎷栨嫿琛屼负鍥炶惤鍒板唴缃€昏緫銆?|

## 鍗歌浇

1. 浠?`~/.dsh/profiles/web/package.json` 鐨?`dsh.profile.bundles` 绉婚櫎 `dsh-drop-in`
2. 鍒犻櫎 `~/.dsh/profiles/web/node_modules/dsh-drop-in/`
3. 閲嶅惎 `dsh web`

## 璁稿彲璇?
MIT


