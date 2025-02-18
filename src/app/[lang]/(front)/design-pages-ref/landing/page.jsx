'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import Button from '@mui/material/Button'
// import 'slick-carousel/slick/slick.css'
// import 'slick-carousel/slick/slick-theme.css'

// import Slider from 'react-slick'

import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Badge from '@mui/material/Badge'
import classnames from 'classnames'
import { useKeenSlider } from 'keen-slider/react'

import CustomAvatar from '@core/components/mui/Avatar'

import AppKeenSlider from '@/libs/styles/AppKeenSlider'

// Page
const LandingPage = ({ params }) => {
  // var settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1
  // }

  // States
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Hooks
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      // initial: 0,
      slides: {
        perView: 2,
        spacing: 0,
        origin: 'auto',
        duration: 180000
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setLoaded(true)
      },
      breakpoints: {
        '(max-width: 1200px)': {
          slides: {
            perView: 2,
            spacing: 10,
            origin: 'auto'
          }
        },
        '(max-width: 900px)': {
          slides: {
            perView: 2,
            spacing: 10
          }
        },
        '(max-width: 600px)': {
          slides: {
            perView: 1,
            spacing: 10,
            origin: 'center'
          }
        }
      }
    },
    // [
    //   slider => {
    //     let timeout
    //     const mouseOver = false

    //     function clearNextTimeout() {
    //       clearTimeout(timeout)
    //     }

    //     function nextTimeout() {
    //       clearTimeout(timeout)
    //       if (mouseOver) return
    //       timeout = setTimeout(() => {
    //         slider.next()
    //       }, 2000)
    //     }

    //     slider.on('created', nextTimeout)
    //     slider.on('dragStarted', clearNextTimeout)
    //     slider.on('animationEnded', nextTimeout)
    //     slider.on('updated', nextTimeout)
    //   }
    // ],

    [
      slider => {
        let mouseOver = false
        let timeout

        const clearNextTimeout = () => {
          clearTimeout(timeout)
        }

        const nextTimeout = () => {
          clearTimeout(timeout)
          if (mouseOver) return
          timeout = setTimeout(() => {
            slider.next()
          }, 2000)
        }

        slider.on('created', () => {
          slider.container.addEventListener('mouseover', () => {
            mouseOver = true
            clearNextTimeout()
          })
          slider.container.addEventListener('mouseout', () => {
            mouseOver = false
            nextTimeout()
          })
          nextTimeout()
        })
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  // Data
  const data = [
    {
      desc: "1: I've never used a theme as versatile and flexible as Vuexy. It's my go to for building dashboard sites on almost any project.",
      svg: '',
      rating: 5,
      name: 'Eugenia Moore',
      position: 'Founder of Pinterest',
      avatarSrc: '/images/avatars/1.png'
    },
    {
      desc: '2: Materio is awesome, and I particularly enjoy knowing that if I get stuck on something.',
      svg: '',
      rating: 5,
      name: 'Tommy haffman',
      position: 'Founder of Netflix',
      avatarSrc: '/images/avatars/2.png'
    },
    {
      desc: "3: This template is superior in so many ways. The code, the design, the regular updates, the support.. It's the whole package. Excellent Work.",
      svg: '',
      rating: 4,
      name: 'Eugenia Moore',
      position: 'CTO of Airbnb',
      avatarSrc: '/images/avatars/3.png'
    },
    {
      desc: "4: All the requirements for developers have been taken into consideration, so I'm able to build any interface I want.",
      svg: '',
      rating: 5,
      name: 'Sara Smith',
      position: 'Founder of Coinbase',
      avatarSrc: '/images/avatars/4.png'
    },
    {
      desc: "I've never used a theme as versatile and flexible as Vuexy. It's my go to for building dashboard sites on almost any project.",
      svg: '',
      rating: 5,
      name: 'Tommy haffman',
      position: 'Founder of Dribble',
      avatarSrc: '/images/avatars/5.png'
    },
    {
      desc: "I've never used a theme as versatile and flexible as Vuexy. It's my go to for building dashboard sites on almost any project.",
      svg: '',
      rating: 5,
      name: 'Eugenia Moore',
      position: 'Founder of Pinterest',
      avatarSrc: '/images/avatars/6.png',
      color: '#2882C3'
    },
    {
      desc: 'Materio is awesome, and I particularly enjoy knowing that if I get stuck on something.',
      svg: '',
      rating: 5,
      name: 'Tommy haffman',
      position: 'Founder of HubSpot',
      avatarSrc: '/images/avatars/7.png'
    },
    {
      desc: "This template is superior in so many ways. The code, the design, the regular updates, the support.. It's the whole package. Excellent Work.",
      svg: '',
      rating: 4,
      name: 'Eugenia Moore',
      position: 'CTO of Airbnb',
      avatarSrc: '/images/avatars/8.png'
    },
    {
      desc: "All the requirements for developers have been taken into consideration, so I'm able to build any interface I want.",
      svg: '',
      rating: 5,
      name: 'Sara Smith',
      position: 'Founder of Coinbase',
      avatarSrc: '/images/avatars/9.png'
    },
    {
      desc: 'Materio is awesome, and I particularly enjoy knowing that if I get stuck on something.',
      svg: '',
      rating: 5,
      name: 'Tommy haffman',
      position: 'Founder of Dribbble',
      avatarSrc: '/images/avatars/10.png'
    }
  ]

  return (
    <div className=''>
      <div className='header-main'>
        <div className='common-container'>
          <div className='header-inner'>
            <div className='header-left'>
              <Link href=''>
                <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
              </Link>
            </div>
            <div className='header-right'>
              <ul>
                <li>
                  <Link href=''>Home</Link>
                </li>
                <li>
                  <Link href=''>Contact Us</Link>
                </li>
                <li className='btn-padding'>
                  <Button className='border-btn-common'>Join</Button>
                </li>
                <li>
                  <Button className='fill-btn-common'>Log in</Button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className='common-page'>
        <div className='banner-main'>
          <div className='banner-main-img'>
            <img src='/images/nourishubs/front/banner-img.jpg' alt='banner'></img>
          </div>
          <div className='banner-text'>
            <div className='common-container'>
              <h1>Nourishing the Future</h1>
            </div>
          </div>
        </div>
        <div className='about-sign-up'>
          <div className='common-container'>
            <div className='about-sign-up-flex'>
              <div className='about-sign-up-left'>
                <h2>
                  Nourishing<br></br> Connections : Schools, Parents & Caterers
                </h2>
              </div>
              <div className='about-sign-up-right'>
                <div className='common-bg-box about-sign-up-right-inner'>
                  <p>
                    Welcome to Nourishubs, where we offer healthy options for school meals. Join us in promoting
                    nutritious meals for students and making healthy eating accessible for families.
                  </p>
                  <Button className='fill-btn-common width-auto'>Sign Up</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='discover-block'>
          <div className='discover-block-shape-top'>
            <img src='/images/nourishubs/front/shape-img.png' alt='shape-img'></img>
          </div>
          <div className='discover-block-shape-bottom'>
            <img src='/images/nourishubs/front/shape-img-2.png' alt='shape-img'></img>
          </div>
          <div className='common-container'>
            <div className='discover-block-inner'>
              <div className='common-title'>
                <h2>Discover how our platform connects school, parents & healthy food Vendors</h2>
              </div>
              <div className='discover-block-three'>
                <div className='discover-block-three-inner'>
                  <div className='common-bg-box'>
                    <div className='img-category'>
                      <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                    </div>
                    <div className='catagory-text'>
                      <h4>Effortlessly manage healthy meal orders for your school community</h4>
                      <p>Signing up is simple : schools, parents & vendors can register in minutes</p>
                      <Link href={''}>
                        Sign Up <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className='discover-block-three-inner'>
                  <div className='common-bg-box'>
                    <div className='img-category'>
                      <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                    </div>
                    <div className='catagory-text'>
                      <h4>Collaborate on Menus and Schedule meal delivery with ease.</h4>
                      <p>Schools and vendors agree on menus, ensuring students receive nutrition meals.</p>
                      <Link href={''}>
                        Join <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className='discover-block-three-inner'>
                  <div className='common-bg-box'>
                    <div className='img-category'>
                      <img src='/images/nourishubs/front/category-img.png' alt='category-img'></img>
                    </div>
                    <div className='catagory-text'>
                      <h4>Stay informed with notifications about upcoming meal events & Orders</h4>
                      <p>Registeres students will receive alerts for ordering meals ahead of time.</p>
                      <Link href={''}>
                        Get Started <img src='/images/nourishubs/front/arrow-icon.png' alt='arrow-icon'></img>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='testimonials-slider'>
          <div className='common-container'>
            <div className='testimonials-slider-inner'>
              <h2>TESTIMONIALS</h2>
              <div className='testimonials-slider-inner-keep'>
                {/* <Slider {...settings}>
                <div>
                  <h3>1</h3>
                </div>
                <div>
                  <h3>2</h3>
                </div>
                <div>
                  <h3>3</h3>
                </div>
                <div>
                  <h3>4</h3>
                </div>
                <div>
                  <h3>5</h3>
                </div>
                <div>
                  <h3>6</h3>
                </div>
              </Slider> */}

                <AppKeenSlider>
                  <div ref={sliderRef} className='keen-slider relative1'>
                    {/* <div className='keen-slider__slide'>
                      <img src='/images/nourishubs/front/banner/banner-16.jpg' alt='swiper 16' />
                    </div>
                    <div className='keen-slider__slide'>
                      <img src='/images/nourishubs/front/banner/banner-17.jpg' alt='swiper 17' />
                    </div>
                    <div className='keen-slider__slide'>
                      <img src='/images/nourishubs/front/banner/banner-18.jpg' alt='swiper 18' />
                    </div>
                    <div className='keen-slider__slide'>
                      <img src='/images/nourishubs/front/banner/banner-19.jpg' alt='swiper 19' />
                    </div>
                    <div className='keen-slider__slide'>
                      <img src='/images/nourishubs/front/banner/banner-20.jpg' alt='swiper 20' />
                    </div> */}

                    {data.map((item, index) => (
                      <div key={index} className='keen-slider__slide'>
                        <Card elevation={8} className='common-bg-box'>
                          <CardContent className='common-bg-box-rating'>
                            <div className='common-bg-box-rating-block'>
                              <div className='rating-block'>
                                {item.svg}
                                <Rating
                                  value={item.rating}
                                  readOnly
                                  sx={{
                                    '& .MuiRating-iconFilled': { color: 'var(--nh-primary-light-color)' }, // Filled stars
                                    '& .MuiRating-iconEmpty': { color: 'var(--nh-primary-light-color)' } // Empty stars (optional)
                                  }}
                                />
                              </div>
                              <div className='discription-block'>
                                <p>{item.desc}</p>
                              </div>

                              <div className='profile-testi'>
                                <div className='img-testi-profile'>
                                  <CustomAvatar size={80} src={item.avatarSrc} alt={item.name} />
                                  <div className='content-profile'>
                                    <h3>{item.name}</h3>
                                    <p>{item.position}</p>
                                  </div>
                                </div>
                                <div className='profile-logo'>
                                  <CustomAvatar
                                    className='profile-logo-img'
                                    size={50}
                                    src={item.avatarSrc}
                                    alt={item.name}
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>

                  {loaded && instanceRef.current && (
                    <div className='swiper-dots'>
                      {[...Array(instanceRef.current.track.details.slides.length).keys()].map(idx => {
                        return (
                          <Badge
                            key={idx}
                            variant='dot'
                            component='div'
                            className={classnames({
                              active: currentSlide === idx
                            })}
                            onClick={() => {
                              instanceRef.current?.moveToIdx(idx)
                            }}
                          ></Badge>
                        )
                      })}
                    </div>
                  )}
                </AppKeenSlider>
              </div>
            </div>
          </div>
        </div>
        <div className='join-section'>
          <div className='common-container'>
            <div className='join-section-inner'>
              <div className='join-section-inner-left'>
                <div className='common-title mb-none'>
                  <h2>
                    Join Our<br></br> Healthy Food Movement
                  </h2>
                </div>
              </div>
              <div className='join-section-inner-right'>
                <p>
                  Discover how easy it is so provide nutritious meals for your students sign up today to connect with
                  local vendors and enhance your school’s food offerings
                </p>
                <Button className='fill-btn-common width-auto'>Sign Up</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='footer-front'>
        <div className='footer-front-subscribtion'>
          <div className='common-container'>
            <div className='footer-front-subscribtion-flex'>
              <div className='footer-front-subscribtion-flex-left'>
                <div className='common-title'>
                  <h2>Subscribe to Updates</h2>
                </div>
                <p>Stay informed about healthy meal options for your kids.</p>
              </div>
              <div className='footer-front-subscribtion-flex-right'>
                <form>
                  <div className='form-group'>
                    <input type='email' placeholder='Enter Your Email'></input>
                    <Button className='fill-btn-common width-auto'>Subscribe</Button>
                  </div>
                </form>
                <p>By Subscribing you Accept our Privacy Policy & Terms.</p>
              </div>
            </div>
          </div>
        </div>
        <div className='footer-middle'>
          <div className='common-container'>
            <div className='footer-middle-flex'>
              <div className='footer-middle-flex-left'>
                <div className='f-logo'>
                  <Link href=''>
                    <img src='/images/nourishubs/front/logo.svg' alt='logo'></img>
                  </Link>
                </div>
                <p>
                  Welcome to Nourishubs, where we offer healthy options for school meals. Join us in promoting
                  nutritious meals for students and making healthy eating accessible for families.
                </p>
              </div>
              <div className='footer-middle-flex-right'>
                <div className='f-menu'>
                  <h3>Quick Links</h3>
                  <ul>
                    <li>
                      <Link href=''>Contact us</Link>
                    </li>
                    <li>
                      <Link href=''>Privacy Policy</Link>
                    </li>
                  </ul>
                </div>
                <div className='f-menu social-menu'>
                  <h3>Follow Us</h3>
                  <ul>
                    <li>
                      <Link href=''></Link>
                    </li>
                    <li>
                      <Link href=''></Link>
                    </li>
                    <li>
                      <Link href=''></Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='footer-bottom'>
          <p>
            Copy right 2024 @ <Link href=''>Nourishubs</Link>, All right reserved
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
