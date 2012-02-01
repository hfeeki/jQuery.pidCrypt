/**
*
*  SHA512 (Secure Hash Algorithm) for use in pidCrypt Library
*  Depends on pidCrypt (pidcrypt.js, pidcrypt_util.js)
*
*
**/
/* A JavaScript implementation of the SHA family of hashes, as defined in FIPS PUB 180-2
 * Version 1.11 Copyright Brian Turek 2008
 * Distributed under the BSD License
 * See http://jssha.sourceforge.net/ for more information
 *
 * Several functions taken from Paul Johnson
 */
if(typeof(pidCrypt) != 'undefined')
{

  function Int_64(msint_32,lsint_32)
  {
    this.highOrder=msint_32;
    this.lowOrder=lsint_32;
  }
  function jsSHA(srcString)
  {
    jsSHA.charSize=8;
    jsSHA.b64pad ="";
    jsSHA.hexCase=0;
    var sha384=null;
    var sha512=null;
    var str2binb=function(str)
    {
      var bin=[];
      var mask =(1 << jsSHA.charSize)- 1;
      var length=str.length*jsSHA.charSize;
      for(var i=0;i<length;i += jsSHA.charSize)
      {
        bin[i >> 5] |=(str.charCodeAt(i/jsSHA.charSize)& mask)<<(32-jsSHA.charSize-i%32);
      }
      return bin;
    };
    var strBinLen=srcString.length*jsSHA.charSize;
    var strToHash=str2binb(srcString);

    var binb2hex=function(binarray)
    {
      var hex_tab=jsSHA.hexCase?"0123456789ABCDEF":"0123456789abcdef";
      var str="";
      var length=binarray.length*4;
      for(var i=0;i<length;i++)
      {
        str += hex_tab.charAt((binarray[i >> 2] >>((3-i%4)* 8+4))& 0xF)+ hex_tab.charAt((binarray[i >> 2] >>((3-i%4)* 8))& 0xF);
      }
      return str;
    };

    var binb2b64=function(binarray)
    {
      var tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var str="";
      var length=binarray.length*4;
      for(var i=0;i<length;i += 3)
      {
        var triplet =(((binarray[i >> 2] >> 8 *(3-i%4))& 0xFF)<< 16)|(((binarray[i+1 >> 2] >> 8 *(3 -(i+1)% 4))& 0xFF)<< 8)|((binarray[i+2 >> 2] >> 8 *(3 -(i+2)% 4))& 0xFF);
        for(var j=0;j<4;j++)
        {
          if(i*8+j*6>binarray.length*32)
          {
            str += jsSHA.b64pad;
          }
          else
          {
            str += tab.charAt((triplet >> 6 *(3-j))& 0x3F);
          }
        }
      }
      return str;
    };

    var rotr=function(x,n)
    {
      if(n<32)
      {
        return new Int_64((x.highOrder >>> n)|(x.lowOrder <<(32-n)),(x.lowOrder >>> n)|(x.highOrder <<(32-n)));
      }
      else if(n===32)
           {
               return new Int_64(x.lowOrder,x.highOrder);
           }
           else
           {
             return rotr(rotr(x,32),n-32);
           }
    };

    var shr=function(x,n){if(n<32){return new Int_64(x.highOrder >>> n,x.lowOrder >>> n |(x.highOrder <<(32-n)));
    }
    else if(n===32)
           {
             return new Int_64(0,x.highOrder);
           }
           else
           {
             return shr(shr(x,32),n-32);
           }
    };

    var ch=function(x,y,z)
    {
      return new Int_64((x.highOrder & y.highOrder)^(~x.highOrder & z.highOrder),(x.lowOrder & y.lowOrder)^(~x.lowOrder & z.lowOrder));
    };

    var maj=function(x,y,z)
    {
      return new Int_64((x.highOrder & y.highOrder)^(x.highOrder & z.highOrder)^(y.highOrder & z.highOrder),(x.lowOrder & y.lowOrder)^(x.lowOrder & z.lowOrder)^(y.lowOrder & z.lowOrder));
    };

    var sigma0=function(x)
    {
      var rotr28=rotr(x,28);
      var rotr34=rotr(x,34);
      var rotr39=rotr(x,39);
      return new Int_64(rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder);
    };

    var sigma1=function(x)
    {
      var rotr14=rotr(x,14);
      var rotr18=rotr(x,18);
      var rotr41=rotr(x,41);
      return new Int_64(rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder);
    };

    var gamma0=function(x)
    {
      var rotr1=rotr(x,1);
      var rotr8=rotr(x,8);
      var shr7=shr(x,7);
      return new Int_64(rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder);
    };

    var gamma1=function(x)
    {
      var rotr19=rotr(x,19);
      var rotr61=rotr(x,61);
      var shr6=shr(x,6);
      return new Int_64(rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder);
    };

    var safeAdd=function(x,y)
    {
      var lsw =(x.lowOrder & 0xFFFF)+(y.lowOrder & 0xFFFF);
      var msw =(x.lowOrder >>> 16)+(y.lowOrder >>> 16)+(lsw >>> 16);
      var lowOrder =((msw & 0xFFFF)<< 16)|(lsw & 0xFFFF);
      lsw =(x.highOrder & 0xFFFF)+(y.highOrder & 0xFFFF)+(msw >>> 16);
      msw =(x.highOrder >>> 16)+(y.highOrder >>> 16)+(lsw >>> 16);
      var highOrder =((msw & 0xFFFF)<< 16)|(lsw & 0xFFFF);
      return new Int_64(highOrder,lowOrder);
    };

    var coreSHA2=function(variant)
    {
      var W=[];
      var a,b,c,d,e,f,g,h;
      var T1,T2;
      var H;
      var K=[new Int_64(0x428a2f98,0xd728ae22),new Int_64(0x71374491,0x23ef65cd),new Int_64(0xb5c0fbcf,0xec4d3b2f),new Int_64(0xe9b5dba5,0x8189dbbc),new Int_64(0x3956c25b,0xf348b538),new Int_64(0x59f111f1,0xb605d019),new Int_64(0x923f82a4,0xaf194f9b),new Int_64(0xab1c5ed5,0xda6d8118),new Int_64(0xd807aa98,0xa3030242),new Int_64(0x12835b01,0x45706fbe),new Int_64(0x243185be,0x4ee4b28c),new Int_64(0x550c7dc3,0xd5ffb4e2),new Int_64(0x72be5d74,0xf27b896f),new Int_64(0x80deb1fe,0x3b1696b1),new Int_64(0x9bdc06a7,0x25c71235),new Int_64(0xc19bf174,0xcf692694),new Int_64(0xe49b69c1,0x9ef14ad2),new Int_64(0xefbe4786,0x384f25e3),new Int_64(0x0fc19dc6,0x8b8cd5b5),new Int_64(0x240ca1cc,0x77ac9c65),new Int_64(0x2de92c6f,0x592b0275),new Int_64(0x4a7484aa,0x6ea6e483),new Int_64(0x5cb0a9dc,0xbd41fbd4),new Int_64(0x76f988da,0x831153b5),new Int_64(0x983e5152,0xee66dfab),new Int_64(0xa831c66d,0x2db43210),new Int_64(0xb00327c8,0x98fb213f),new Int_64(0xbf597fc7,0xbeef0ee4),new Int_64(0xc6e00bf3,0x3da88fc2),new Int_64(0xd5a79147,0x930aa725),new Int_64(0x06ca6351,0xe003826f),new Int_64(0x14292967,0x0a0e6e70),new Int_64(0x27b70a85,0x46d22ffc),new Int_64(0x2e1b2138,0x5c26c926),new Int_64(0x4d2c6dfc,0x5ac42aed),new Int_64(0x53380d13,0x9d95b3df),new Int_64(0x650a7354,0x8baf63de),new Int_64(0x766a0abb,0x3c77b2a8),new Int_64(0x81c2c92e,0x47edaee6),new Int_64(0x92722c85,0x1482353b),new Int_64(0xa2bfe8a1,0x4cf10364),new Int_64(0xa81a664b,0xbc423001),new Int_64(0xc24b8b70,0xd0f89791),new Int_64(0xc76c51a3,0x0654be30),new Int_64(0xd192e819,0xd6ef5218),new Int_64(0xd6990624,0x5565a910),new Int_64(0xf40e3585,0x5771202a),new Int_64(0x106aa070,0x32bbd1b8),new Int_64(0x19a4c116,0xb8d2d0c8),new Int_64(0x1e376c08,0x5141ab53),new Int_64(0x2748774c,0xdf8eeb99),new Int_64(0x34b0bcb5,0xe19b48a8),new Int_64(0x391c0cb3,0xc5c95a63),new Int_64(0x4ed8aa4a,0xe3418acb),new Int_64(0x5b9cca4f,0x7763e373),new Int_64(0x682e6ff3,0xd6b2b8a3),new Int_64(0x748f82ee,0x5defb2fc),new Int_64(0x78a5636f,0x43172f60),new Int_64(0x84c87814,0xa1f0ab72),new Int_64(0x8cc70208,0x1a6439ec),new Int_64(0x90befffa,0x23631e28),new Int_64(0xa4506ceb,0xde82bde9),new Int_64(0xbef9a3f7,0xb2c67915),new Int_64(0xc67178f2,0xe372532b),new Int_64(0xca273ece,0xea26619c),new Int_64(0xd186b8c7,0x21c0c207),new Int_64(0xeada7dd6,0xcde0eb1e),new Int_64(0xf57d4f7f,0xee6ed178),new Int_64(0x06f067aa,0x72176fba),new Int_64(0x0a637dc5,0xa2c898a6),new Int_64(0x113f9804,0xbef90dae),new Int_64(0x1b710b35,0x131c471b),new Int_64(0x28db77f5,0x23047d84),new Int_64(0x32caab7b,0x40c72493),new Int_64(0x3c9ebe0a,0x15c9bebc),new Int_64(0x431d67c4,0x9c100d4c),new Int_64(0x4cc5d4be,0xcb3e42b6),new Int_64(0x597f299c,0xfc657e2a),new Int_64(0x5fcb6fab,0x3ad6faec),new Int_64(0x6c44198c,0x4a475817)];
      if(variant==="SHA-384")
      {
        H=[new Int_64(0xcbbb9d5d,0xc1059ed8),new Int_64(0x0629a292a,0x367cd507),new Int_64(0x9159015a,0x3070dd17),new Int_64(0x152fecd8,0xf70e5939),new Int_64(0x67332667,0xffc00b31),new Int_64(0x98eb44a87,0x68581511),new Int_64(0xdb0c2e0d,0x64f98fa7),new Int_64(0x47b5481d,0xbefa4fa4)];
      }
      else
      {
        H=[new Int_64(0x6a09e667,0xf3bcc908),new Int_64(0xbb67ae85,0x84caa73b),new Int_64(0x3c6ef372,0xfe94f82b),new Int_64(0xa54ff53a,0x5f1d36f1),new Int_64(0x510e527f,0xade682d1),new Int_64(0x9b05688c,0x2b3e6c1f),new Int_64(0x1f83d9ab,0xfb41bd6b),new Int_64(0x5be0cd19,0x137e2179)];
      }
      var message=strToHash.slice();
      message[strBinLen >> 5] |= 0x80 <<(24-strBinLen%32);
      message[((strBinLen+1+128 >> 10)<< 5)+ 31]=strBinLen;
      var appendedMessageLength=message.length;
      for(var i=0;i<appendedMessageLength;i += 32)
      {
        a=H[0];
        b=H[1];
        c=H[2];
        d=H[3];
        e=H[4];
        f=H[5];
        g=H[6];
        h=H[7];
        for(var t=0;t<80;t++)
        {
          if(t<16)
          {
            W[t]=new Int_64(message[t*2+i],message[t*2+i+1]);
          }
          else
          {
            W[t]=safeAdd(safeAdd(safeAdd(gamma1(W[t-2]),W[t-7]),gamma0(W[t-15])),W[t-16]);
          }
          T1=safeAdd(safeAdd(safeAdd(safeAdd(h,sigma1(e)),ch(e,f,g)),K[t]),W[t]);
          T2=safeAdd(sigma0(a),maj(a,b,c));
          h=g;
          g=f;
          f=e;
          e=safeAdd(d,T1);
          d=c;
          c=b;
          b=a;
          a=safeAdd(T1,T2);
        }
        H[0]=safeAdd(a,H[0]);
        H[1]=safeAdd(b,H[1]);
        H[2]=safeAdd(c,H[2]);
        H[3]=safeAdd(d,H[3]);
        H[4]=safeAdd(e,H[4]);
        H[5]=safeAdd(f,H[5]);
        H[6]=safeAdd(g,H[6]);
        H[7]=safeAdd(h,H[7]);
      }
      switch(variant)
      {
        case "SHA-384":
          return[H[0].highOrder,H[0].lowOrder,H[1].highOrder,H[1].lowOrder,H[2].highOrder,H[2].lowOrder,H[3].highOrder,H[3].lowOrder,H[4].highOrder,H[4].lowOrder,H[5].highOrder,H[5].lowOrder];
        case "SHA-512":
          return[H[0].highOrder,H[0].lowOrder,H[1].highOrder,H[1].lowOrder,H[2].highOrder,H[2].lowOrder,H[3].highOrder,H[3].lowOrder,H[4].highOrder,H[4].lowOrder,H[5].highOrder,H[5].lowOrder,H[6].highOrder,H[6].lowOrder,H[7].highOrder,H[7].lowOrder];
        default:return [];
      }
    };

    this.getHash=function(variant,format)
    {
      var formatFunc=null;
      switch(format)
      {
        case "HEX":
          formatFunc=binb2hex;
        break;
        case "B64":
          formatFunc=binb2b64;
        break;
        default:
          return "FORMAT NOT RECOGNIZED";
      }
      switch(variant)
      {
        case "SHA-384":
          if(sha384===null)
          {
            sha384=coreSHA2(variant);
          }
          return formatFunc(sha384);
        case "SHA-512":
          if(sha512===null)
          {
            sha512=coreSHA2(variant);
          }
          return formatFunc(sha512);
        default:
          return "HASH NOT RECOGNIZED";
      }
    };
  }

  pidCrypt.SHA512 = function(str,format)
  {
    if(!format) format = 'HEX';
    var sha = new jsSHA(str);
    return sha.getHash('SHA-512', format);
  }

  pidCrypt.SHA384 = function(str,format)
  {
    if(!format) format = 'HEX';
    var sha = new jsSHA(str);
    return sha.getHash('SHA-384', format);
  }
}