'use client'

import React, { useState, useEffect } from 'react'
import PetCarousel from '../app/home/_components/petCarousel'
import styles from '../app/home/home.module.css'
import FeatureBlock from '../app/home/_components/featureBlock'
import { FaHeart, FaStore, FaComments, FaDog } from 'react-icons/fa'

export default function Page() {
  return (
    <>
      <PetCarousel />
      <div className={styles.featureGrid_container}>
        <section className={styles.featureGrid}>
          <FeatureBlock
            icon={<FaStore />}
            title="浪浪商城"
            description="挑選你喜歡的浪浪周邊商品，購買也能幫助毛孩們渡過難關"
            link="/store"
          />
          <FeatureBlock
            icon={<FaComments />}
            title="浪浪論壇"
            description="分享你的養寵故事、領養心得，與其他愛心人士一同交流"
            link="/forum"
          />
          <FeatureBlock
            icon={<FaHeart />}
            title="捐款支持"
            description="透過小額捐款，給流浪動物一個新希望，我們一起改變牠們的未來"
            link="/donate"
          />
          <FeatureBlock
            icon={<FaDog />}
            title="認養毛孩"
            description="查看等待認養的毛孩們，牠們都在等一個溫暖的家～你會是牠的家人嗎？"
            link="/pets"
          />
        </section>
      </div>{' '}
      <div className={styles.intro_container}>
        <h3>為什麼成立這個網站呢?</h3>
        <p>「盡己所能、善行延續」</p>
        <p>
          「毛孩之家」是由一群志同道合的朋友合作經營，在曾經陪伴數載的狗狗離開後，希望能將對牠的愛延續下去，因此創建這個寵物送領養的平台，冀望能藉由這個平台讓更多的浪浪能擁有一個家，讓有意願領養動物的人都可以找到有緣分的寵物。目前我們傾向不收費用盡已所能的運作方向，但為了維持網站運作會放置
          Google 廣告，尚請見諒。
          另外，也歡迎相關公益團體或法人與我們聯絡提案合作，我們願意盡量支持與配合。
        </p>
      </div>
    </>
  )
}
