function copyThat(event) {
    let notification = $('<div>Copied</div>');
    $(event.target).append(notification);
    let target = $('textarea.for_copy')[0];
    target.textContent = $(event.target).parent().text().substr(0, $(event.target).parent().text().length-6);
    target.focus();
    target.setSelectionRange(0, target.value.length);
    try {
        let notDiv = $(event.target).find('div').addClass('active');
        setTimeout(() => {
            notDiv.removeClass('active');
            setTimeout(() => {
                notification.remove();
            }, 400)
        }, 1000);
        document.execCommand('copy');
    } catch(e) {
        alert('use CTRL + C to copy content');
    }
}
