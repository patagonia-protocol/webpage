/**
 * Pixi.js Clouds Shader Component
 * A reusable component for embedding animated clouds in any HTML page
 * 
 * Usage:
 * const clouds = new PixiCloudsComponent({
 *   container: '#my-container',
 *   width: 800,
 *   height: 600,
 *   mouseTracking: false
 * });
 */

class PixiCloudsComponent {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      container: options.container || 'body',
      width: options.width || window.innerWidth / 2,
      height: options.height || window.innerHeight / 2,
      mouseTracking: options.mouseTracking !== false, // Default to true
      fixedMouseX: options.fixedMouseX || 400,
      fixedMouseY: options.fixedMouseY || 300,
      backgroundColor: options.backgroundColor || 0x0,
      interactive: options.interactive !== false,
      autoStart: options.autoStart !== false
    };

    this.count = 0;
    this.mouse = null;
    this.animationId = null;

    this.init();
  }

  init() {
    // Create Pixi stage and renderer (PIXI v2 compatibility)
    this.stage = new PIXI.Stage(this.config.backgroundColor);
    this.renderer = new PIXI.WebGLRenderer(this.config.width, this.config.height);

    // Append to specified container
    const container = typeof this.config.container === 'string'
      ? document.querySelector(this.config.container)
      : this.config.container;

    if (!container) {
      console.error('PixiCloudsComponent: Container not found');
      return;
    }

    container.appendChild(this.renderer.view);

    // Setup uniforms
    this.uniforms = {
      iResolution: {
        type: "2f",
        value: {
          x: this.config.width,
          y: this.config.height
        }
      },
      iGlobalTime: {
        type: "1f",
        value: 0
      },
      iMouse: {
        type: "2f",
        value: {
          x: this.config.fixedMouseX,
          y: this.config.fixedMouseY
        }
      }
    };

    // Create shader (PIXI v2 compatibility)
    this.shader = new PIXI.AbstractFilter([this.getFragmentShader().join('\n')], this.uniforms);

    // Create background sprite
    this.bg = PIXI.Sprite.fromImage("https://s3-us-west-2.amazonaws.com/s.cdpn.io/167451/test_BG.jpg");
    this.bg.width = this.config.width;
    this.bg.height = this.config.height;
    this.bg.filters = [this.shader];
    this.stage.addChild(this.bg);

    // Start animation if autoStart is enabled
    if (this.config.autoStart) {
      this.start();
    }
  }

  getFragmentShader() {
    return [
      "precision mediump float;",
      "uniform vec2 iResolution;",
      "uniform float iGlobalTime;",
      "uniform vec2 iMouse;",

      "float hash( float n ) {",
      "return fract(sin(n)*43758.5453);",
      "}",

      "float noise( in vec3 x ) {",
      "vec3 p = floor(x);",
      "vec3 f = fract(x);",
      "f = f*f*(3.0-2.0*f);",
      "float n = p.x + p.y*57.0 + 113.0*p.z;",
      "return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),",
      "mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),",
      "mix(mix( hash(n+113.0), hash(n+114.0),f.x),",
      "mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);",
      "}",

      "vec4 map( in vec3 p ) {",
      "float d = 0.2 - p.y;",
      "vec3 q = p - vec3(1.0,0.1,0.0)*iGlobalTime;",
      "float f;",
      "f  = 0.6000*noise( q ); q = q*2.02;",
      "f += 0.4000*noise( q );",
      "d += 3.0 * f;",
      "d = clamp( d, 0.0, 1.0 );",
      "vec4 res = vec4( d );",
      "res.xyz = mix( 1.15*vec3(1.2,1.15,1.1), vec3(0.85,0.85,0.85), res.x );",
      "return res;",
      "}",

      "vec3 sundir = vec3(-1.0,0.0,0.0);",

      "vec4 raymarch( in vec3 ro, in vec3 rd ) {",
      "vec4 sum = vec4(0, 0, 0, 0);",
      "float t = 0.0;",
      "for(int i=0; i<24; i++) {",
      "if( sum.a > 0.99 ) continue;",
      "vec3 pos = ro + t*rd;",
      "vec4 col = map( pos );",
      "float dif =  clamp((col.w - map(pos+0.3*sundir).w)/0.6, 0.0, 1.0 );",
      "vec3 lin = vec3(0.75,0.75,0.75)*1.35 + 0.45*vec3(0.9, 0.8, 0.7)*dif;",
      "col.xyz *= lin;",
      "col.a *= 0.35;",
      "col.rgb *= col.a;",
      "sum = sum + col*(1.0 - sum.a);",
      "t += max(0.15,0.04*t);",
      "}",
      "sum.xyz /= (0.001+sum.w);",
      "return clamp( sum, 0.0, 1.0 );",
      "}",

      "void main(void) {",
      "vec2 q = gl_FragCoord.xy / iResolution.xy;",
      "vec2 p = -1.0 + 2.0*q;",
      "p.x *= iResolution.x/ iResolution.y;",
      "vec2 mo = -1.0 + 2.0*iMouse.xy / iResolution.xy;",
      "vec3 ro = 4.0*normalize(vec3(cos(2.75-3.0*mo.x), 0.7+(mo.y+1.0), sin(2.75-3.0*mo.x)));",
      "vec3 ta = vec3(0.0, 1.0, 0.0);",
      "vec3 ww = normalize( ta - ro);",
      "vec3 uu = normalize(cross( vec3(0.0,1.0,0.0), ww ));",
      "vec3 vv = normalize(cross(ww,uu));",
      "vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );",
      "vec4 res = raymarch( ro, rd );",
      "float sun = clamp( dot(sundir,rd), 0.0, 1.0 );",
      "vec3 col = vec3(0.6,0.71,0.75) - rd.y*0.2*vec3(1.0,0.5,1.0) + 0.15*0.5;",
      "col += 0.2*vec3(1.0,.6,0.1)*pow( sun, 8.0 );",
      "col *= 0.95;",
      "col = mix( col, res.xyz, res.w );",
      "col += 0.1*vec3(1.0,0.4,0.2)*pow( sun, 3.0 );",
      "gl_FragColor = vec4( col, 1.0 );",
      "}"
    ];
  }

  animate() {
    this.count += 0.01;

    // Handle mouse tracking (PIXI v2 compatibility)
    if (this.config.mouseTracking) {
      try {
        this.mouse = this.stage.interactionManager.mouse.global || { x: this.config.fixedMouseX, y: this.config.fixedMouseY };
        this.shader.uniforms.iMouse.value = {
          x: this.mouse.x,
          y: this.mouse.y
        };
      } catch (e) {
        // Fallback to fixed position if mouse tracking fails
        this.shader.uniforms.iMouse.value = {
          x: this.config.fixedMouseX,
          y: this.config.fixedMouseY
        };
      }
    } else {
      // Use fixed mouse position
      this.shader.uniforms.iMouse.value = {
        x: this.config.fixedMouseX,
        y: this.config.fixedMouseY
      };
    }

    this.shader.uniforms.iGlobalTime.value = this.count;
    this.renderer.render(this.stage);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  // Public methods
  start() {
    if (!this.animationId) {
      this.animate();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.renderer && this.renderer.view && this.renderer.view.parentNode) {
      this.renderer.view.parentNode.removeChild(this.renderer.view);
    }
    if (this.renderer) {
      this.renderer.destroy();
    }
  }

  // Configuration methods
  setMouseTracking(enabled) {
    this.config.mouseTracking = enabled;
  }

  setFixedMousePosition(x, y) {
    this.config.fixedMouseX = x;
    this.config.fixedMouseY = y;
  }

  resize(width, height) {
    this.config.width = width;
    this.config.height = height;
    this.renderer.resize(width, height);
    this.bg.width = width;
    this.bg.height = height;
    this.uniforms.iResolution.value = { x: width, y: height };
  }
}

// Make it available globally
window.PixiCloudsComponent = PixiCloudsComponent;
