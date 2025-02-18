// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Badge from '@mui/material/Badge'
import Rating from '@mui/material/Rating'

// Third-party Imports
import { useKeenSlider } from 'keen-slider/react'
import classnames from 'classnames'

// Core Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Lib Imports
import AppKeenSlider from '@/libs/styles/AppKeenSlider'

/**
 * Page
 */
const TestimonialsSection = props => {
  // States
  const [loaded, setLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Hooks
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
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
    <div className='testimonials-slider'>
      <div className='common-container'>
        <div className='testimonials-slider-inner'>
          <h2>TESTIMONIALS</h2>
          <div className='testimonials-slider-inner-keep'>
            <AppKeenSlider>
              <div ref={sliderRef} className={`keen-slider ${loaded ? '' : 'invisible max-h-80'}`}>
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
  )
}

export default TestimonialsSection
