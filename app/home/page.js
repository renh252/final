'use client'

import React, { useState, useEffect } from 'react'
import PetCarousel from './_components/petCarousel'
import styles from './home.module.css'
import FeatureBlock from './_components/featureBlock'
import { FaHeart, FaStore, FaComments, FaDog } from 'react-icons/fa'

export default function HomePage(props) {
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
      </div>
      
    </>
  )
}
