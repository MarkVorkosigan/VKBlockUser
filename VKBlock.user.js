// ==UserScript==
// @name VKBlockUser
// @namespace VKBlockUser
// @version 1.4
// @description  Прячет сообщения заблоченных пользователей в конфах (беседах). Обязательно нажмите F5, чтобы применить изменения. Hiding messages from blocked users in VK-conferences. Press F5 for applying changes.
// @include https://vk.com/im?*
// @include http://vk.com/im?*
// @grant none
// @copyright Firefly, 2017, firefly2014@yandex.ru
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js
// ==/UserScript==

var start = new Array();	// массив заблокированных пользователей
//localStorage.clear();
//console.log("JSON parse = " + JSON.parse(localStorage.getItem("blacklist")));
var banned_names = start.concat(JSON.parse(localStorage.getItem("blacklist")));
//console.log("banned_names from localstorage = " + banned_names);

var NamesString='a';
for(var k=0; k<banned_names.length; k++)
{
    NamesString += ('[href="'+banned_names[k]+'"],');
}
NamesString = NamesString.slice(0, -1); 	// отрезаем лишнюю запятую справа

//при загрузке страницы скрыть все сообщения заблокированных пользователей
function DeleteMessages(chkbox_value)  {	
	var block = document.querySelectorAll(NamesString), i; //найти все элементы <a> с юзерами из banned_names
	//console.log("block = " + block.toString());
	for(var i=0; i<block.length; ++i)
	{
		// если это элемент <a class="im-mess-stack--lnk">
		if(block[i].className=='im-mess-stack--lnk')
		{	
			//console.log("block[i] = " + $(block[i]).parent().parent().next().toString());
			//нашли - удаляем весь родительский блок
			//block[i].parentNode.parentNode.parentNode.parentNode.style.display='none';

			if (chkbox_value) {
				$(block[i]).parent().parent().parent().parent().hide();	// div class="im-mess-stack _im_mess_stack"
			}
			else {	
				var div_content = $(block[i]).parent().parent().parent();	// div class="im-mess-stack--content"
				$(".im_msg_text", div_content).each(function() {
					$(this).hide().after('<div class="blocked-message wall_module _im_log_body" style=" font-size: 75%"> [ Сообщение удалено ] </div>');
				});
				//$(".page_post_sized_thumbs",  div_content).hide();			// прячем картинки
				$('div[class^="_im_msg_media"]', div_content).hide();			// прячем скинутые пользователем картинки, аудиозаписи, документы etc
			}		
		}
	}
}

$(document).ready(function() {
	//alert('Ready()');
	// проверяем чат это на двоих или конфа. Если больше двух пользователей, то это конфа и в заголовке беседы будет указано количество ее участников.
	var count = $("button._im_chat_members.im-page--members").length;

	if( count !== 0 )	{	// это конфа
		// в зависимости от значения чекбокса либо прячем все сообщения пользователя, либо заменяем их на "сообщение удалено"
		var chkbox_value = JSON.parse(localStorage.getItem("hideChekboxValue"));
		//console.log('chkbox_value: ' + typeof(chkbox_value) + " " + chkbox_value);
		DeleteMessages(chkbox_value);
	}	
});

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true, subtree: true }

// select the target node
var peer_target = document.querySelector('._im_peer_history');
//var target = document.getElementById('page_wrap');

// create an observer instance
var im_observer = new MutationObserver(function(mutations) {

	// есть ли среди дочерних элементов кнопка? 
	function my_hasClass(element, cls) {
		return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

    mutations.forEach(function(mutationRecord) {
		var newNodes = mutationRecord.addedNodes; // DOM NodeList
		//console.log(newNodes.length + ' nodes added');
		if( newNodes !== null ) { 				  // If there are new nodes added
			$.each(newNodes, function (index, node) {	
				//console.log( node.nodeName + " - was loaded" );
				//console.log("node.nodeName =>>>>>>> " + node.nodeName);
				
				// скрываем сообщение, которое либо: а) только что пришло и находится в DIV , б) только что загружено из истории (скроллинг вверх) и находится в DIV
				if  (node.nodeName =='DIV') {	// "im-mess-stack _im_mess_stack" 
					//console.dir(' ---> UList:' + $(this).parent().prev().children().first().children().first().attr("href"));
					 link = $(this).children().first().children().first().children().first().children().first().children().first().attr("href");
					 if (banned_names.includes(link)) {
						var chk_box1 = JSON.parse(localStorage.getItem("hideChekboxValue"));			
						if (chk_box1) {
							$(this).hide();			// div class="im-mess-stack _im_mess_stack"
						}
						else {	
							$(this).children().last().children().last().children().each(function() {		// по всем LI
								$(':nth-child(3)', $(this)).hide().after('<div class="blocked-message im-mess--text wall_module _im_log_body" style=" \
																		font-size: 75%"> [ Сообщение удалено ] </div>');
							});
							//$(".page_post_sized_thumbs", $(this)).hide();			// прячем картинки
							$('div[class^="_im_msg_media"]',  $(this)).hide();		// прячем скинутые пользователем картинки, аудиозаписи, документы etc
						}
					}	
									
				}		// if  (node.nodeName =='DIV') {

				// скрываем сообщение, которое только что пришло и находится в LI 
				else { 
					if  (node.nodeName =='LI') {
						//console.dir(' ---> UList:' + $(this).parent().prev().children().first().children().first().attr("href"));
						link = $(this).parent().prev().children().first().children().first().attr("href");
						if (banned_names.includes(link)) {
							//console.log("HIDING DIV 1 ...");
							//$(this).parent().parent().parent().hide();
							$(':nth-child(3)', $(this)).hide().after('<div class="blocked-message im-mess--text wall_module _im_log_body" style=" \
																	font-size: 75%"> [ Сообщение удалено ] </div>');
							//$(".page_post_sized_thumbs", $(this)).hide();			// прячем картинки
							$('div[class^="_im_msg_media"]',  $(this)).hide();		// прячем скинутые пользователем картинки, аудиозаписи, документы etc
							//console.dir(' =========> ' + $(this).parent().parent().get(0));
						}
					}
				}
				
			});			// $.each()
		}

	});

});

// pass in the target node, as well as the observer options
im_observer.observe(peer_target, config);

// работаем со списком членов конфы  - div class="popup_box_container"
var box_target = document.querySelector('#box_layer_wrap');

var popup_box_observer = new MutationObserver(function(changes) {
    changes.forEach(function(mutation) {
		var newNodes = mutation.addedNodes; 
			if ( mutation.type == 'childList' ) {			
				if( newNodes !== null ) { 				  // панель участников открыта
					//var abc = JSON.parse(localStorage.getItem("hideChekboxValue"));
					//console.log("localStorage ====================> " + abc);
					$( "#hide_chkbox" ).prop('checked', JSON.parse(localStorage.getItem("hideChekboxValue")));
					//console.log('checkbox ===> ' + $("#hide_chkbox").prop('checked'));

					$.each(newNodes, function (index, node) {	
						//console.log('Количество вызовов: ' + index);
						// добавляем кнопки delete и restore
						$(".im-member-item--name", $(this)).append('<span style="padding-right:10px; float:right"><button class="delete-button" style="text-align:center; color: red; background-color:#FFE8E8; \
															 		vertical-align:middle; border:1px solid;  box-shadow:0 1px 3px rgb(255,109,109); border-radius:50%; width:80%; line-height:14px; font-size:10px;" \
																	title="Заблокировать"><span>X</span></button></span>',
																   '<span style="padding-right:10px; float:right"><button class="restore-button" style="display:none; text-align:center; color: green; background-color:#D7FFC6; \
															 		vertical-align:middle; border:1px solid;  box-shadow:0 1px 3px rgb(54,255,54); border-radius:50%; width:80%; line-height:14px; font-size:10px;" \
																	title="Разблокировать"><span>O</span></button></span>'
																	);
						// кнопка для стирания любого упоминания о пользователе
						$(".im-members--wrap._im_chat_members", $(this)).prepend('<span style="padding-left:35%; float:left"><input type="checkbox" id="hide_chkbox" \
																				  name="hide_chkbox"> <label>Скрывать полностью</label></span>');
						

						// добавляем созданным кнопкам классы равные id юзера, к которому кнопка относится
						$(".delete-button, .restore-button", $(this)).each(function() {
							user_id = $(this).parent().parent().children().first().attr('href');
							//console.log("id_class ===>" + user_id);
							$(this).addClass(user_id.substr(1));	
						});

						// если пользователь заблочен, то его delete-кнопку скрываем, а restore-кнопку показываем
						for(var i=0; i<banned_names.length; ++i) {
							$(".delete-button").each(function() {
								user_id = $(this).parent().parent().children().first().attr('href');
								if (user_id == banned_names[i]) {
									//console.log("!!! user_id == banned_names (delete) !!!");
									//console.log("user_id = " + user_id);
									//console.log("banned_names[i] = " + banned_names[i]);
									$( this ).hide();
									var btn_class_restore = ".restore-button." + user_id.substr(1);
									$(btn_class_restore).show();
								}
							});
						}
			
					});
				}		// if( newNodes !== null ) {} 
			}		// if ( mutation.type == 'childList' ) {} 

	});		// changes.forEach(function(mutation) {}

	// сохранение состояния чекбокса в localstorage
	$( "#hide_chkbox" ).change(function () {
		localStorage.setItem("hideChekboxValue", $(this).prop('checked'));
		//console.log('CHANGE checkbox value = ' + $(this).prop('checked'));
	});


	// нажатие на delete-кнопку сохраняет заблоченного пользователя в localstorage, скрывает delete-кнопку и показывает restore-кнопку
	$(".delete-button").click(function() {
		var user_id_block = $(this).parent().parent().children().first().attr('href');
		if (banned_names.indexOf(user_id_block) == -1) {
			banned_names.push(user_id_block);
			//console.info("banned name was added: " + banned_names.toString());
			localStorage.setItem("blacklist", JSON.stringify(banned_names));
		}	
		$(this).hide();
		var btn_class_restore = ".restore-button." + user_id_block.substr(1);
		$(btn_class_restore).show();
		
	});
	// нажатие на restore-кнопку удаляет заблоченного пользователя из localstorage, показывает delete-кнопку и скрывает restore-кнопку
	$(".restore-button").click(function() {
		var user_id_restore = $(this).parent().parent().children().first().attr('href');
		//console.log('User ID: ' + user_id_restore);
		remove_by_index = banned_names.indexOf(user_id_restore);
		// удаляем юзера из массива заблоченных
		if (remove_by_index > -1) {
			//delete banned_names[user_id_restore];
			banned_names.splice(remove_by_index, 1);
			//console.info("banned name was removed: " + banned_names.toString());
			localStorage.setItem("blacklist", JSON.stringify(banned_names));
		}
		$(this).hide();
		var btn_class_delete = ".delete-button." + user_id_restore.substr(1);
		$(btn_class_delete).show();
	});

	
}); // new MutationObserver(function(changes) {}

popup_box_observer.observe(box_target, config);

