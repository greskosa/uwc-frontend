/*
*@date 30.10.2012-1.11.2012
*@version 1.0
*create by Sergey Gresko
*/
(function( $ ){
    $.fn.technicalSupportPlugin = function(options) {
        var defaults={
            backgroundSelecor:'#container',
            timeDisapiarinLastWindow:3000
        }; //default options
        var isIE=false; // is Internet Explorer browser
        var isNotiOS=true;
        var versionIE=null; // which Internet Explorer browser version
        var whatFileAttached=null;  //what file was attached by user in chat
        var isNeedImitateAnswer=true;

       var settings = $.extend({}, defaults, options); //merge settings
       var $this=this;

       initialize=function(){
           detectBrowser();
           initTruncateMethod();
           renderTSLink();
        };
        detectBrowser=function(){
            var matchIE= navigator.appVersion.match(/MSIE (\d)\.0/); //detect IE and version
            if(matchIE){
                isIE=true;
                versionIE=matchIE[1];
            }
            var matchiOS=navigator.appVersion.match(/OS \d+_\d+/); //detect iOS
            if(matchiOS){
                isNotiOS=false;
            }
        };
        initTruncateMethod=function(){
            String.prototype.truncate = function() { //method truncates the length of name of file if it need
                var finalFileName='';
                var modalWindowWidth=$('.modal_window > div').width(); //width of the modal window
                var maxLength= Math.floor(35*modalWindowWidth/600*(modalWindowWidth*1.3/600)); //max length of file which depends on width of the modal window
                var needLength=maxLength-2;
                if(this.length>maxLength){
                    finalFileName=this.replace(new RegExp('([a-zA-Zа-яА-ЯёЁ0-9\\s_\\-!]{1,'+needLength+'}).+'),'$1...');
                }
                else{
                    finalFileName=this.slice(0);
                }
                return finalFileName;
            };
        };
        renderTSLink=function(){ //render link which create magic :)
            $this.append('<span class="ico_descus"></span>'); //add icon
            $this.addClass('main_TS_link').addClass('gradient_lime').addClass('border_radius');
            if(isIE&&versionIE<9){ //fixing of vertical align for bad browsers
                $this.css('top','38%');
            }
            else{
                var marginTop=parseInt($this.width(),10)/2 - 18; //minus padding
                $this.css('marginTop','-'+marginTop+'px');
            }
            linkHoverEvent();
            linkClickEvent();
        };
        linkHoverEvent=function(){
            $this.hover(
                function(){
                    $(this).stop(true,true).animate({'left':'+=9px'},200)
                },
                function(){
                    $(this).stop(true,true).animate({'left':'-=9px'},200)
                });
        };
        linkClickEvent=function(){
            $this.click(function(e){
                e.preventDefault();
                createModal('modal_TS');
            });
        };
       createModal=function(classBlock){
           if(isNotiOS){ //iOs doesn't like css blur filter
               $(settings.backgroundSelecor).addClass('bluring');
           }
            if($('.'+classBlock).length>0){ //if already was created main modal window
                $('.modal_window').removeClass('makeInvisible');
            }
            else{
                if(classBlock=='modal_TS'){
                    renderModal('Технічна підтримка слухає','завершити чат',classBlock);
                    fillMainModal();
                }
                else if(classBlock=='modal_send'){
                    renderModal('Чат завершено!','завершити вікно',classBlock);
                    fillSendModal();
                }
               closeChat(classBlock); // close button functionality
               dinamicHorizontalAlign(classBlock);
               $(window).resize(function(){
                     dinamicHorizontalAlign(classBlock);
               });
               destroyModalEvent(classBlock); //destroing of modal window event
            }
        };
        chatInput=function(){
            $('.chat_input textarea').on('keypress',function(e){
                var message= $.trim($(this).val());
                var messageLength=message.length;
                if(e.keyCode==13){
                    if(messageLength>0||whatFileAttached) //if anything was typing or attached file
                        appendMessage();
                }
            });
            $('.chat_file input[type=button]').on('click',function(){
                var message=$.trim($('.chat_input textarea').val());
                var messageLength=message.length;
                if(messageLength>0||whatFileAttached)
                    appendMessage();

            });
        };
        appendMessage=function(whoWrite, whatWritten){
            var attachedFile='', stylingPerson='';
            whoWrite=whoWrite||'Ви';
            var $textArea=$('.chat_input textarea');
            whatWritten=whatWritten||$.trim($textArea.val());
            if(whatFileAttached){
                attachedFile='<a class="attached_file">'+whatFileAttached+'</a>';
            }
            if(whoWrite=='Підтримка')
                stylingPerson='support';
            var date = new Date();
            var minutes=date.getMinutes()<10 ? '0'+date.getMinutes():date.getMinutes();
            var time=date.getDate()+'.'+parseInt(date.getMonth()+1,10)+'.'+date.getFullYear()+': '+date.getHours()+':'+minutes;
            $('.chat_main').append('<div class="one_message">'+
                                        '<span class="'+stylingPerson+'">'+whoWrite+' ('+time+'):</span>'+
                                        '<p>'+ whatWritten+'</p>'+
                                         attachedFile+
                                    '</div>');
            $textArea.val('');
            $('.chat_main').stop(true,true).animate({scrollTop: $(document).height()},600);
            whatFileAttached=null;
            $('#attached_file').empty().hide();
            if(whatWritten=='Перезапустив, допомогло, дякую.')
               imitateAnswer(); // imitate answer from technickal support !!!!!!!
        };
        imitateAnswer=function(){
            if(isNeedImitateAnswer){
                isNeedImitateAnswer=false; //no more answers
                setTimeout(function(){
                       whatFileAttached=null; //without file!
                       appendMessage('Підтримка', 'Звертайтесь) Раді допомогти ;)');
                },3000);
            }
        };
        fileAttaching=function(){
            $('input[type=file]').change(function(){
                alert(1);
                var allPath=$(this).val();
                alert(allPath);
                var matchedFile=allPath.match(/\\*([a-zA-Zа-яА-ЯёЁ0-9\s_\-!]+\.\w{2,6})$/);
                if(matchedFile){
                    $('#attached_file').html(matchedFile[1].truncate());
                    $('#attached_file').css('display','block'); //with .show() display:inline for <a>!!!
                    whatFileAttached=matchedFile[1];
                }
                else{
                    $(this).val('');
                    whatFileAttached=null;
                    $('#attached_file').trigger('click');
                    alert('Некоректне ім\'я файлу');
                }
            });
            $('#attached_file').click(function(e){
                e.preventDefault();
                $('#attached_file').empty().hide();
                $('input[type=file]').val('');
                whatFileAttached=null;
            });
        };
        renderModal=function(headerText, closeText, classBlock){
            $('.modal_window').remove(); //clear modal
            $('body').append('<div class="modal_window">'+
                                '<div class="'+classBlock+'">'+
                                    '<div class="quote"></div>'+
                                    '<div class="modal_header gradient_lime border_radius">'+
                                        '<a class="close_window border_radius_3"><span class="ico_x2"></span>'+closeText+'</a>'+
                                        '<div><span class="ico_descus "></span> '+headerText+'</div>'+
                                    '</div>'+
                                    '<div class="modal_content gradient_lime_reverse border_radius"></div>'
                                +'</div>');
        };
        fillMainModal=function(){
           $('.modal_content').html('<div class="chat_TS border_radius">'+
                '<div class="chat_main">'+
                    '<div class="one_message">'+
                        '<span class="support">Підтримка (26.10.2012: 15:35):</span>'+
                        '<p>Доброго дня, чим можу допомогти?</p>'+
                    '</div>'+
                   '<div class="one_message">'+
                        '<span>Ви (26.10.2012: 15:36):</span>'+
                        '<p>У мене не працює праска. Чи зв\'язано це з тим, що на Марсі погана погода?</p>'+
                        '<a class="attached_file">погода.doc</a>'+
                   '</div>'+
                   '<div class="one_message">'+
                       '<span class="support">Підтримка (26.10.2012: 15:39):</span>'+
                        '<p>Перезапусть вашу праску...Повинно допомгти :)</p>'+
                   '</div>'+
                '</div>'+
                '<div class="chat_input">'+
                    '<textarea rows="4">Перезапустив, допомогло, дякую.</textarea>'+
                '</div>'+
                '<div class="chat_file">'+
                    '<form method="post" action="" enctype="multipart/form-data">'+
                        '<input type="button" value="надіслати" class="go_button">'+
                        '<input type="file">'+
                        '<a href="#"><span>вкласти файл</span></a>'+
                        '<a id="attached_file"></a>'+
                    '</form>'+
                '</div>'+
            '</div>');
            fileAttaching(); //file Attaching functional
            chatInput();     //chat imitation
        };
        fillSendModal=function(){
           $('.modal_content').html('<div class="chat_TS border_radius">'+
                'Надіслати копію чату на пошту'+
                '<div class="enter_email">'+
                   '<input type="button" disabled="disabled" value="надіслати" class="go_button">'+
                   '<input type="email"  placeholder="Адреса електронної пошти">'+
                '</div>'+
            '</div>');
            validateEmail();
        };
        dinamicHorizontalAlign=function(classBlock){
            var marginLeft=parseInt($('.'+classBlock).width(),10)/2; //minus padding
            $('.'+classBlock).css('marginLeft','-'+marginLeft+'px');
            $('#attached_file').text($('#attached_file').text().truncate());
        };
        destroyModalEvent=function(classBlock){
            $(document).on('keyup',function(e){//cross-browsers keypress Event
                if(e.keyCode==27)  // if ESC
                {
                    if(classBlock=='modal_TS'){
                        manipulateWithModals(classBlock);
                    }
                    else
                        destroyingModal(classBlock);
                }
            });
        };
        destroyingModal=function(classBlock){
            var time=isIE ? 0:1000; //time for animation
            $('.'+classBlock).addClass('goAnimationBack');
            setTimeout(function(){ //fix for Opera
                $('.'+classBlock).remove();
            },time-100);
            setTimeout(function(){
                $('.modal_window').addClass('makeInvisible');
                $(settings.backgroundSelecor).removeClass('bluring');
            },time);
        };
        closeChat=function(classBlock){
             $('.'+classBlock+' .close_window').on('click',function(e){
                 e.preventDefault();
                 manipulateWithModals(classBlock);
             });
        };
        manipulateWithModals=function(classBlock){
            destroyingModal(classBlock);
            var time=isIE ? 0:1000; //time for animation
            if(classBlock=='modal_TS'){
                setTimeout(function(){
                    createModal('modal_send');
                },time);
            }
        };
        validateEmail=function(){
            sendEmailClick();
            $('input[type=email]').on('keyup',function(e){
                var valueInput=$(this).val();
                if(valueInput.match(/^([a-zA-Z0-9]{1,20})([\._-]{1,1}[a-zA-Z0-9]{1,15})*@([a-z]+([\._-]{1,1}[a-z]{1,10})*\.{1,1}[a-z]{2,4})$/i))
                {
                    $('.go_button').removeAttr('disabled');
                    if(e.keyCode==13) // if ENTER
                    {
                       $('.go_button').click();
                    }
                }
                else{
                    $('.go_button').attr('disabled','disabled');
                }
            });
        };
        sendEmailClick=function(){
            $('.go_button').on('click',function(){
                $('.chat_TS').html('<p class="thanx">Дякуємо за звернення до служби підтримки!</p>');
                setTimeout(function(){
                    destroyingModal('modal_send');
                },settings.timeDisapiarinLastWindow);

            });
        };
       initialize(); //init of plugin
    };
})( jQuery );