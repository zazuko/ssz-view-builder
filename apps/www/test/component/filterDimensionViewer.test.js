import { expect } from 'chai'
import sinon from 'sinon'
import clownface from 'clownface'
import $rdf from 'rdf-ext'
import { toSparql } from 'clownface-shacl-path'
import viewer from '../../src/component/filterDimensionViewer.js'
import { ssz, view } from '../../src/ns.js'
import { testData } from '../_helpers.js'

describe('component/filterDimensionViewer.js', () => {
  let update

  beforeEach(() => {
    update = sinon.spy()
  })

  describe('init', () => {
    it('does not set value when there is no :baseDimension', async () => {
      // given
      const graph = clownface({ dataset: $rdf.dataset() })
      const focusNode = graph.node('')
      const value = {
        object: focusNode.out(view.dimension),
      }

      // when
      viewer.init({ focusNode, value }, { update })

      // then
      expect(update).not.to.have.been.called
    })

    it('does not set value when there is :baseDimension path equals current', async () => {
      // given
      const focusNode = await testData`
        <>
          ${view.dimension} [
            ${view.from} [
              ${view.source} [ ${view.cube} <cube> ] ;
              ${view.path} ( <ZEIT> <hasEnd> ) ;
            ] ;
          ] ;
          ${ssz.baseDimension} [
            ${view.from} [
              ${view.source} [ ${view.cube} <cube> ] ;
              ${view.path} ( <ZEIT> <hasEnd> ) ;
            ] ;
          ] ;
        .
      `
      const value = {
        object: focusNode.out(view.dimension),
      }

      // when
      viewer.init({ focusNode, value }, { update })

      // then
      expect(update).not.to.have.been.called
    })

    it('sets value when there is :baseDimension and no current value', async () => {
      // given
      const focusNode = await testData`
        <>
          ${ssz.baseDimension} [
            ${view.from} [
              ${view.source} <source> ;
              ${view.path} <ZEIT> ;
            ] ;
          ] ;
        .
        
        <source> ${view.cube} <cube> .
      `
      const value = {
      }

      // when
      viewer.init({ focusNode, value }, { update })

      // then
      expect(update).to.have.been.calledWith(
        sinon.match(dimensionWith({ source: $rdf.namedNode('source'), path: '<ZEIT>' })),
      )
    })

    it('sets value when there is a :baseDimension but without the deep property', async () => {
      // given
      const focusNode = await testData`
        <>
          ${view.dimension} [
            ${view.from} [
              ${view.source} <source> ;
              ${view.path} <ZEIT> ;
            ] ;
          ] ;
          ${ssz.baseDimension} [
            ${view.from} [
              ${view.source} <source> ;
              ${view.path} <ZEIT> ;
            ] ;
          ] ;
          ${ssz.drillDownProperty} <hasEnd> ;
        .
        
        <source> ${view.cube} <cube> .
      `
      const value = {
        object: focusNode.out(view.dimension),
      }

      // when
      viewer.init({ focusNode, value }, { update })

      // then
      expect(update).to.have.been.calledWith(
        sinon.match(dimensionWith({ source: $rdf.namedNode('source'), path: '<ZEIT>/<hasEnd>' })),
      )
    })
  })
})

function dimensionWith({ source, path }) {
  return (actual) => {
    try {
      const actualSource = actual.out(view.from).out(view.source).term
      const actualPath = toSparql(actual.out(view.from).out(view.path))
        .toString({ prologue: false })

      return source.equals(actualSource) && path === actualPath
    } catch {
      return false
    }
  }
}
