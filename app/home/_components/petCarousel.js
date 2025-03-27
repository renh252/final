'use client'

import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import Card from '@/app/_components/ui/Card'
import styles from './petCarousel.module.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function PetCarousel() {
  const { data } = useSWR('/api/pets?type=meta', fetcher)
  const pets = data?.latestPets || []

  const [isSliderReady, setIsSliderReady] = useState(false)
  const shouldInitSlider = pets.length > 0

  const [sliderRef, instanceRef] = useKeenSlider(
    shouldInitSlider
      ? {
          loop: true,
          slides: { perView: 1.5, spacing: 0 },
          breakpoints: {
            '(min-width: 640px)': {
              slides: { perView: 2.5, spacing: 0 },
            },
            '(min-width: 1024px)': {
              slides: { perView: 3.5, spacing: 0 },
            },
          },
          created() {
            setIsSliderReady(true)
          },
        }
      : null // ⛔ 若資料還沒到，不初始化
  )

  useEffect(() => {
    if (!isSliderReady || !instanceRef.current) return

    const slider = instanceRef.current
    const interval = setInterval(() => {
      if (slider.track && slider.track.details) {
        try {
          slider.next()
        } catch (error) {
          console.error('自動滑動錯誤：', error)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isSliderReady, instanceRef])

  return (
    <section className={styles.carouselSection}>
      <div className={styles.headerWrap}>
        <h2 className={styles.title}>毛孩們</h2>
        <p className={styles.subtitle}>領養代替購買，給浪浪一個家</p>
      </div>
      <div className="relative">
        <div ref={sliderRef} className="keen-slider">
          {pets.map((pet) => (
            <div className="keen-slider__slide" key={pet.id}>
              <Card
              styles={{width:'50px'}}
                image={pet.main_photo || '/images/default_no_pet.jpg'}
                title={pet.name}
              >
                <p>品種：{pet.variety}</p>
                <p>
                  <span>年齡：{pet.age}</span>・<span>{pet.gender}</span>
                </p>
                <p>地點：{pet.location}</p>
              </Card>
            </div>
          ))}
        </div>
        <button
          onClick={() => instanceRef.current?.prev()}
          className={styles.navButton + ' ' + styles.prev}
        >
          ‹
        </button>
        <button
          onClick={() => instanceRef.current?.next()}
          className={styles.navButton + ' ' + styles.next}
        >
          ›
        </button>
      </div>
    </section>
  )
}
