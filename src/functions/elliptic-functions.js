
function jacobiTheta( n, x, q, tolerance=1e-10 ) {

  if ( abs(q) >= 1 ) throw 'Unsupported elliptic nome';

  if ( ![1,2,3,4].includes(n) ) throw 'Undefined Jacobi theta index';

  if ( isComplex(x) || isComplex(q) ) {

    if ( !isComplex(x) ) x = complex(x);

    var piTau = div( log(q), complex(0,1) );

    // dlmf.nist.gov/20.2 to reduce overflow
    if ( Math.abs(x.im) > Math.abs(piTau.im) || Math.abs(x.re) > Math.PI ) {

      var pt = Math.round( x.im / piTau.im );
      x = sub( x, mul( pt, piTau ) );

      var p = Math.round( x.re / Math.PI );
      x = sub( x, p * Math.PI );

      var qFactor = pow( q, -pt*pt );
      var eFactor = exp( mul( -2 * pt, x, complex(0,1) ) );

      // factors can become huge, so chop spurious parts first
      switch( n ) {

        case 1:

          return mul( (-1)**(p+pt), qFactor, eFactor, chop( jacobiTheta( n, x, q ), tolerance ) );

        case 2:

          return mul( (-1)**p, qFactor, eFactor, chop( jacobiTheta( n, x, q ), tolerance ) );

        case 3:

          return mul( qFactor, eFactor, chop( jacobiTheta( n, x, q ), tolerance ) );

        case 4:

          return mul( (-1)**pt, qFactor, eFactor, chop( jacobiTheta( n, x, q ), tolerance ) );

      }

    }

    switch( n ) {

      case 1:

        var s = complex(0);
        var p = complex(1);
        var i = 0;

        while ( Math.abs(p.re) > tolerance || Math.abs(p.im) > tolerance ) {
          p = mul( (-1)**i, pow( q, i*i+i ), sin( mul(2*i+1,x) ) );
          s = add( s, p );
          i++;
        }

        return mul( 2, pow( q, 1/4 ), s );

      case 2:

        var s = complex(0);
        var p = complex(1);
        var i = 0;

        while ( Math.abs(p.re) > tolerance || Math.abs(p.im) > tolerance ) {
          p = mul( pow( q, i*i+i ), cos( mul(2*i+1,x) ) );
          s = add( s, p );
          i++;
        }

        return mul( 2, pow( q, 1/4 ), s );

      case 3:

        var s = complex(0);
        var p = complex(1);
        var i = 1;

        while ( Math.abs(p.re) > tolerance || Math.abs(p.im) > tolerance ) {
          p = mul( pow( q, i*i ), cos( mul(2*i,x) ) );
          s = add( s, p );
          i++;
        }

        return add( 1, mul(2,s) );

      case 4:

        var s = complex(0);
        var p = complex(1);
        var i = 1;

        while ( Math.abs(p.re) > tolerance || Math.abs(p.im) > tolerance ) {
          p = mul( pow( neg(q), i*i ), cos( mul(2*i,x) ) );
          s = add( s, p );
          i++;
        }

        return add( 1, mul(2,s) );

      }

  }

  // dlmf.nist.gov/20.2 to reduce overflow
  if ( Math.abs(x.re) > Math.PI ) {

    var p = Math.round( x / Math.PI );
    x = x - p * Math.PI;

    switch( n ) {

      case 1:
      case 2:

        return (-1)**p * jacobiTheta( n, x, q );

      case 3:
      case 4:

        return jacobiTheta( n, x, q );

    }

  }

  switch( n ) {

    case 1:

      if ( q < 0 ) return jacobiTheta( n, x, complex(q) );

      var s = 0;
      var p = 1;
      var i = 0;

      while ( Math.abs(p) > tolerance ) {
        p = (-1)**i * q**(i*i+i) * sin( (2*i+1) * x );
        s += p;
        i++;
      }

      return 2 * q**(1/4) * s;

    case 2:

      if ( q < 0 ) return jacobiTheta( n, x, complex(q) );

      var s = 0;
      var p = 1;
      var i = 0;

      while ( Math.abs(p) > tolerance ) {
        p = q**(i*i+i) * cos( (2*i+1) * x );
        s += p;
        i++;
      }

      return 2 * q**(1/4) * s;

    case 3:

      var s = 0;
      var p = 1;
      var i = 1;

      while ( Math.abs(p) > tolerance ) {
        p = q**(i*i) * cos( 2*i * x );
        s += p;
        i++;
      }

      return 1 + 2 * s;

    case 4:

      var s = 0;
      var p = 1;
      var i = 1;

      while ( Math.abs(p) > tolerance ) {
        p = (-q)**(i*i) * cos( 2*i * x );
        s += p;
        i++;
      }

      return 1 + 2 * s;

  }

}


function ellipticNome( m ) {

  if ( isComplex(m) ) return exp( div( mul( -pi, ellipticK( sub(1,m) ) ), ellipticK(m) ) );

  if ( m > 1 ) return ellipticNome( complex(m) );

  if ( m < 0 ) return -exp( -pi * ellipticK( 1/(1-m) ) / ellipticK( m/(m-1) ) );

  return exp( -pi * ellipticK(1-m) / ellipticK(m) );

}


function sn( x, m ) {

  var q = ellipticNome(m);

  if ( m > 1 || isComplex(x) || isComplex(m) ) {

    var t = div( x, pow( jacobiTheta(3,0,q), 2 ) );

    return mul( div( jacobiTheta(3,0,q), jacobiTheta(2,0,q) ),
                div( jacobiTheta(1,t,q), jacobiTheta(4,t,q) ) );

  }

  var t = x / jacobiTheta(3,0,q)**2;

  if ( m < 0 )
    return jacobiTheta(3,0,q) / jacobiTheta(4,t,q)
           * div( jacobiTheta(1,t,q), jacobiTheta(2,0,q) ).re;

  return jacobiTheta(3,0,q) / jacobiTheta(2,0,q)
         * jacobiTheta(1,t,q) / jacobiTheta(4,t,q);

}

function cn( x, m ) {

  var q = ellipticNome(m);

  if ( m > 1 || isComplex(x) || isComplex(m) ) {

    var t = div( x, pow( jacobiTheta(3,0,q), 2 ) );

    return mul( div( jacobiTheta(4,0,q), jacobiTheta(2,0,q) ),
                div( jacobiTheta(2,t,q), jacobiTheta(4,t,q) ) );

  }

  var t = x / jacobiTheta(3,0,q)**2;

  if ( m < 0 )
    return jacobiTheta(4,0,q) / jacobiTheta(4,t,q)
           * div( jacobiTheta(2,t,q), jacobiTheta(2,0,q) ).re;

  return jacobiTheta(4,0,q) / jacobiTheta(2,0,q)
         * jacobiTheta(2,t,q) / jacobiTheta(4,t,q);

}

function dn( x, m ) {

  var q = ellipticNome(m);

  if ( m > 1 || isComplex(x) || isComplex(m) ) {

    var t = div( x, pow( jacobiTheta(3,0,q), 2 ) );

    return mul( div( jacobiTheta(4,0,q), jacobiTheta(3,0,q) ),
                div( jacobiTheta(3,t,q), jacobiTheta(4,t,q) ) );

  }

  var t = x / jacobiTheta(3,0,q)**2;

  return jacobiTheta(4,0,q) / jacobiTheta(3,0,q)
         * jacobiTheta(3,t,q) / jacobiTheta(4,t,q);

}

function am( x, m ) {

  if ( m > 1 || isComplex(x) || isComplex(m) ) {

    if ( !isComplex(x) ) x = complex(x);
    if ( !isComplex(m) ) m = complex(m);

    if ( m.im === 0 && m.re <= 1 ) {

      var K = ellipticK( m.re );
      var n = Math.round( x.re / 2 / K );
      x = sub( x, 2 * n * K );

      if ( m.re < 0 ) {

        var Kp = ellipticK( 1 - m.re );
        var p = Math.round( x.im / 2 / Kp.re );

        // bitwise test for odd integer
        if ( p & 1 ) return sub( n * pi, arcsin( sn(x,m) ) );

      }

      return add( arcsin( sn(x,m) ), n * pi );

    }

    return arcsin( sn(x,m) );

  } else {

    var K = ellipticK(m);
    var n = Math.round( x / 2 / K );
    x = x - 2 * n * K;

    return Math.asin( sn(x,m) ) + n * pi;

  }

}


function weierstrassRoots( g2, g3 ) {

  function cubicTrigSolution( p, q, n ) {

    // p, q both negative in defining cubic

    return mul( 2/sqrt(3), sqrt(p),
                cos( sub( div( arccos( mul( 3*sqrt(3)/2, q, pow(p,-3/2) ) ), 3 ),
                          2*pi*n/3 ) ) );
  }

  g2 = div( g2, 4 );
  g3 = div( g3, 4 );

  var e1 = cubicTrigSolution( g2, g3, 0 );
  var e2 = cubicTrigSolution( g2, g3, 1 );
  var e3 = cubicTrigSolution( g2, g3, 2 );

  return [ e1, e2, e3 ];

}

function weierstrassHalfPeriods( g2, g3 ) {

  var [ e1, e2, e3 ] = weierstrassRoots( g2, g3 );

  var w1 = inverseWeierstrassP( e1, g2, g3 );
  var w3 = inverseWeierstrassP( e3, g2, g3 );

  return [ w1, w3 ];

}

function weierstrassInvariants( w1, w3 ) {

  if ( !isComplex(w1) ) w1 = complex(w1);
  if ( !isComplex(w3) ) w3 = complex(w3);

  // order half periods by complex slope
  if ( w3.im/w3.re < w1.im/w1.re ) [ w1, w3 ] = [ w3, w1 ];

  var ratio =  div( w3, w1 ), conjugate;

  if ( ratio.im < 0 ) {
    ratio.im = -ratio.im;
    conjugate = true;
  }

  var q = exp( mul( complex(0,1), pi, ratio ) );

  // en.wikipedia.org/wiki/Weierstrass's_elliptic_functions
  // modified for input of half periods

  var a = jacobiTheta( 2, 0, q );
  var b = jacobiTheta( 3, 0, q );

  var g2 = mul( 4/3*pi**4, pow( mul(2,w1), -4 ),
                add( pow(a,8), mul( -1, pow(a,4), pow(b,4) ), pow(b,8) ) );

  var g3 = mul( 8/27*pi**6, pow( mul(2,w1), -6 ),
                add( pow(a,12), mul( -3/2, pow(a,8), pow(b,4) ),
                                mul( -3/2, pow(a,4), pow(b,8) ), pow(b,12) ) );

  if ( conjugate ) {
    g2.im = -g2.im;
    g3.im = -g3.im;
  }

  return [ g2, g3 ];

}


function weierstrassP( x, g2, g3 ) {

  if ( !isComplex(x) ) x = complex(x);

  var [ e1, e2, e3 ] = weierstrassRoots( g2, g3 );

  // Whittaker & Watson, Section 22.351

  var m = div( sub(e2,e3), sub(e1,e3) );

  return add( e3, mul( sub(e1,e3), pow( sn( mul( x, sqrt(sub(e1,e3)) ), m ), -2 ) ) );

}

function weierstrassPPrime( x, g2, g3 ) {

  if ( !isComplex(x) ) x = complex(x);

  var [ e1, e2, e3 ] = weierstrassRoots( g2, g3 );

  // Whittaker & Watson, Section 22.351

  var m = div( sub(e2,e3), sub(e1,e3) );

  var argument = mul( x, sqrt(sub(e1,e3)) );

  return mul( -2, pow( sub(e1,e3), 3/2 ), cn( argument, m ), dn( argument, m ),
              pow( sn( argument, m ), -3 ) );

}

function inverseWeierstrassP( x, g2, g3 ) {

  if ( !isComplex(x) ) x = complex(x);

  var [ e1, e2, e3 ] = weierstrassRoots( g2, g3 );

  // Johansson arxiv.org/pdf/1806.06725.pdf p.17
  // sign of imaginary part on real axis differs from Mathematica

  return carlsonRF( sub(x,e1), sub(x,e2), sub(x,e3) );

}

