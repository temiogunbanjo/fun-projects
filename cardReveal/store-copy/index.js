let tl = gsap.timeline();
      tl.from("#ads-section .card", {
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        // ease: "bounce.out",
        // ease: "elastic.out(1,0.3)",
        ease: "power4.out",
        // ease: "slow(0.7,0.7,false)",
        stagger: 0.15,
        // ease: "expoScale(0.9,7,none)",
      });

      tl.from(
        "#card-library .card",
        {
          opacity: 0,
          scale: 0.5,
          duration: 0.5,
          // ease: "bounce.out",
          // ease: "elastic.out(1,0.3)",
          ease: "power4.out",
          // ease: "slow(0.7,0.7,false)",
          stagger: 0.15,
          // ease: "expoScale(0.9,7,none)",
        },
        "<"
      );

      tl.from(
        "#power-library .slot",
        {
          opacity: 0,
          marginLeft: "30vw",
          duration: 1,
          // ease: "bounce.out",
          ease: "elastic.out(1,0.9)",
          // ease: "power4.out",
          // ease: "slow(0.7,0.7,false)",
          stagger: 0.25,
          // ease: "expoScale(0.9,7,none)",
        },
        "<"
      );