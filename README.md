
#jQuery plugin to impliment RSA public key encryption

  Utilizes the pidCrypt libraries for client public key
  encryption while the associated PHP class uses
  OpenSSL to generate the necessary private/public key pairs used
  by this plug-in

  Fork me @ https://www.github.com/jas-/jQuery.pidCrypt

## REQUIREMENTS:
* jQuery libraries (required - http://www.jquery.com)
* pidCrypt RSA & AES libraries (required - https://www.pidder.com/pidcrypt/)
* jQuery cookie plugin (optional - http://plugins.jquery.com/files/jquery.cookie.js.txt)

## FEATURES:
* HTML5 localStorage support
* HTML5 sessionStorage support
* Cookie support
* Debugging output

## METHODS:
* Default: Uses public key to encrypt form data prior to sending
* Sign: Uses public key to sign data being emailed to recipient
* Encypt_sign: Uses public key to encrypt and send email to recipient

## OPTIONS:
* storage: HTML5 localStorage, sessionStorage and cookies supported
* callback: Optional function used once server recieves encrypted data
* reset: Prevent local caching of public key (forces server requests)
* debug: Appends debugging information

## EXAMPLES:
* Default usage using HTML5 localStorage
```$('#form').pidCrypt();```

* Default Using HTML5 sessionStorage
```$('#form').pidCrypt({storage:'sessionStorage'});```

* Default using cookies (requires the jQuery cookie plug-in)
```$('#form').pidCrypt({storage:'cookie'});```

* Example of using the callback method to process server response
```$('#form').pidCrypt({callback:function(){ console.log('foo'); }});```

* Disable local caching of public key
```$('#form').pidCrypt({cache:false});```

* Enable debugging output
```$('#form').pidCrypt({debug:true});```

Author: Jason Gerfen <jason.gerfen@gmail.com>
License: GPL (see LICENSE)
